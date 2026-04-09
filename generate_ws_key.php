<?php
require_once('wp-load.php');

if (!class_exists('WC_API_Authentication')) {
    echo "WooCommerce not active.";
    exit;
}

global $wpdb;

// Let's create a new API Key for user ID 1
$user_id = 1;
$description = 'Vercel Headless API Key ' . time();
$permissions = 'read_write';

// Generate keys
$consumer_key    = 'ck_' . wc_rand_hash();
$consumer_secret = 'cs_' . wc_rand_hash();

$data = array(
    'user_id'         => $user_id,
    'description'     => $description,
    'permissions'     => $permissions,
    'consumer_key'    => wc_api_hash( $consumer_key ),
    'consumer_secret' => $consumer_secret, // saved as plain text locally and generated securely
    'truncated_key'   => substr( $consumer_key, -7 )
);

$inserted = $wpdb->insert(
    $wpdb->prefix . 'woocommerce_api_keys',
    $data,
    array(
        '%d',
        '%s',
        '%s',
        '%s',
        '%s',
        '%s'
    )
);

if ( $inserted ) {
    echo "SUCCESS\n";
    echo "WC_CONSUMER_KEY=" . $consumer_key . "\n";
    echo "WC_CONSUMER_SECRET=" . $consumer_secret . "\n";
} else {
    echo "FAILED to insert key";
}

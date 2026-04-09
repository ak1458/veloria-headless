<?php
require_once('wp-load.php');
global $wpdb;

$user_id = 1;
$description = 'Vercel Headless API Key ' . time();
$permissions = 'read_write';

$consumer_key    = 'ck_' . wp_generate_password(40, false);
$consumer_secret = 'cs_' . wp_generate_password(40, false);

if (function_exists('wc_api_hash')) {
    $hashed_key = wc_api_hash($consumer_key);
} else {
    $hashed_key = hash_hmac( 'sha256', $consumer_key, 'wc-api' );
}

$data = array(
    'user_id'         => $user_id,
    'description'     => $description,
    'permissions'     => $permissions,
    'consumer_key'    => $hashed_key,
    'consumer_secret' => $consumer_secret,
    'truncated_key'   => substr( $consumer_key, -7 )
);

$inserted = $wpdb->insert(
    $wpdb->prefix . 'woocommerce_api_keys',
    $data,
    array('%d','%s','%s','%s','%s','%s')
);

if ( $inserted ) {
    echo "SUCCESS\n";
    echo "WC_CONSUMER_KEY=" . $consumer_key . "\n";
    echo "WC_CONSUMER_SECRET=" . $consumer_secret . "\n";
} else {
    echo "FAILED to insert key. Error: " . $wpdb->last_error . "\n";
}

<?php
$headers = [];
foreach ($_SERVER as $name => $value) {
    if (substr($name, 0, 5) == 'HTTP_') {
        $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
    }
}
print_r($headers);
if (isset($_SERVER['PHP_AUTH_USER'])) echo "PHP_AUTH_USER=" . $_SERVER['PHP_AUTH_USER'] . "\n";
if (isset($_SERVER['HTTP_AUTHORIZATION'])) echo "HTTP_AUTHORIZATION=" . $_SERVER['HTTP_AUTHORIZATION'] . "\n";
echo "OK\n";

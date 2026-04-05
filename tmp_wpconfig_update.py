import re
with open('/home/u679998479/domains/veloriavault.com/public_html/wp-config.php', 'r') as f:
    c = f.read()
c = c.replace(
    "define('WP_HOME', 'https://veloriavault.com');",
    "define('WP_HOME', 'https://' . $_SERVER['HTTP_HOST']);"
)
c = c.replace(
    "define('WP_SITEURL', 'https://veloriavault.com');",
    "define('WP_SITEURL', 'https://' . $_SERVER['HTTP_HOST']);"
)
with open('/home/u679998479/domains/veloriavault.com/public_html/wp-config.php', 'w') as f:
    f.write(c)
print('wp-config.php updated successfully')

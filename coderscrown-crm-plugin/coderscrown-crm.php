<?php
/**
 * Plugin Name: CodersCrown CRM
 * Plugin URI: https://coderscrown.com
 * Description: Complete CRM system for web design agencies with leads management, N8N integration, projects, and tickets.
 * Version: 1.0.0
 * Author: CodersCrown
 * Author URI: https://coderscrown.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: coderscrown-crm
 * Domain Path: /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

/**
 * Currently plugin version.
 */
define( 'CODERSCROWN_CRM_VERSION', '1.0.0' );
define( 'CODERSCROWN_CRM_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'CODERSCROWN_CRM_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

/**
 * The code that runs during plugin activation.
 */
function activate_coderscrown_crm() {
    require_once CODERSCROWN_CRM_PLUGIN_DIR . 'includes/class-crm-activator.php';
    CRM_Activator::activate();
}

/**
 * The code that runs during plugin deactivation.
 */
function deactivate_coderscrown_crm() {
    require_once CODERSCROWN_CRM_PLUGIN_DIR . 'includes/class-crm-deactivator.php';
    CRM_Deactivator::deactivate();
}

register_activation_hook( __FILE__, 'activate_coderscrown_crm' );
register_deactivation_hook( __FILE__, 'deactivate_coderscrown_crm' );

/**
 * The core plugin class.
 */
require CODERSCROWN_CRM_PLUGIN_DIR . 'includes/class-coderscrown-crm.php';

/**
 * Begins execution of the plugin.
 */
function run_coderscrown_crm() {
    $plugin = new CodersCrown_CRM();
    $plugin->run();
}
run_coderscrown_crm();

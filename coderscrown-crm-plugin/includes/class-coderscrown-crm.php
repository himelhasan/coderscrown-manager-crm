<?php
/**
 * The core plugin class
 *
 * @package CodersCrown_CRM
 */

class CodersCrown_CRM {

    /**
     * The loader that's responsible for maintaining and registering all hooks.
     */
    protected $loader;

    /**
     * The unique identifier of this plugin.
     */
    protected $plugin_name;

    /**
     * The current version of the plugin.
     */
    protected $version;

    /**
     * Initialize the plugin.
     */
    public function __construct() {
        $this->version = CODERSCROWN_CRM_VERSION;
        $this->plugin_name = 'coderscrown-crm';

        $this->load_dependencies();
        $this->define_admin_hooks();
        $this->define_api_hooks();
    }

    /**
     * Load the required dependencies for this plugin.
     */
    private function load_dependencies() {
        // Core classes
        require_once CODERSCROWN_CRM_PLUGIN_DIR . 'includes/class-crm-security.php';
        require_once CODERSCROWN_CRM_PLUGIN_DIR . 'includes/class-crm-helpers.php';
        
        // Admin classes
        if ( is_admin() ) {
            require_once CODERSCROWN_CRM_PLUGIN_DIR . 'admin/class-dashboard.php';
            require_once CODERSCROWN_CRM_PLUGIN_DIR . 'admin/class-leads-admin.php';
            require_once CODERSCROWN_CRM_PLUGIN_DIR . 'admin/class-projects-admin.php';
            require_once CODERSCROWN_CRM_PLUGIN_DIR . 'admin/class-tickets-admin.php';
            require_once CODERSCROWN_CRM_PLUGIN_DIR . 'admin/class-api-keys-admin.php';
            require_once CODERSCROWN_CRM_PLUGIN_DIR . 'admin/class-csv-importer.php';
        }
        
        // API classes
        require_once CODERSCROWN_CRM_PLUGIN_DIR . 'api/class-api-authentication.php';
        require_once CODERSCROWN_CRM_PLUGIN_DIR . 'api/class-crm-rest-controller.php';
    }

    /**
     * Register all admin-related hooks.
     */
    private function define_admin_hooks() {
        if ( is_admin() ) {
            add_action( 'admin_init', array( $this, 'handle_admin_submissions' ) );
            add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
            add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
        }
    }

    /**
     * Register all API-related hooks.
     */
    private function define_api_hooks() {
        add_action( 'rest_api_init', array( 'CRM_REST_Controller', 'register_routes' ) );
    }

    /**
     * Add admin menu items.
     */
    public function add_admin_menu() {
        // Main menu
        // Main menu
        add_menu_page(
            __( 'CRM Dashboard', 'coderscrown-crm' ),
            __( 'CRM', 'coderscrown-crm' ),
            'view_crm_dashboard', // Changed from manage_crm to view_crm_dashboard
            'crm-dashboard',
            array( 'CRM_Dashboard', 'render_dashboard' ),
            'dashicons-businessman',
            30
        );
        
        // Dashboard submenu
        add_submenu_page(
            'crm-dashboard',
            __( 'Dashboard', 'coderscrown-crm' ),
            __( 'Dashboard', 'coderscrown-crm' ),
            'view_crm_dashboard',
            'crm-dashboard',
            array( 'CRM_Dashboard', 'render_dashboard' )
        );
        
        // Leads submenu
        add_submenu_page(
            'crm-dashboard',
            __( 'Leads', 'coderscrown-crm' ),
            __( 'Leads', 'coderscrown-crm' ),
            'manage_crm_leads',
            'crm-leads',
            array( 'CRM_Leads_Admin', 'render_leads_page' )
        );
        
        // Projects submenu
        add_submenu_page(
            'crm-dashboard',
            __( 'Projects', 'coderscrown-crm' ),
            __( 'Projects', 'coderscrown-crm' ),
            'view_crm_dashboard', // Shared capability
            'crm-projects',
            array( 'CRM_Projects_Admin', 'render_projects_page' )
        );
        
        // Tickets submenu
        add_submenu_page(
            'crm-dashboard',
            __( 'Tickets', 'coderscrown-crm' ),
            __( 'Tickets', 'coderscrown-crm' ),
            'view_crm_dashboard', // Shared capability
            'crm-tickets',
            array( 'CRM_Tickets_Admin', 'render_tickets_page' )
        );
        
        // API Keys submenu
        add_submenu_page(
            'crm-dashboard',
            __( 'API Keys', 'coderscrown-crm' ),
            __( 'API Keys', 'coderscrown-crm' ),
            'manage_crm_api_keys',
            'crm-api-keys',
            array( 'CRM_API_Keys_Admin', 'render_api_keys_page' )
        );
    }

    /**
     * Enqueue admin assets.
     */
    public function enqueue_admin_assets( $hook ) {
        // Only load on CRM pages
        if ( strpos( $hook, 'crm-' ) === false ) {
            return;
        }
        
        $asset_file = include( CODERSCROWN_CRM_PLUGIN_DIR . 'build/index.asset.php' );

        wp_enqueue_style(
            'coderscrown-crm-style',
            CODERSCROWN_CRM_PLUGIN_URL . 'build/index.css',
            array(),
            $asset_file['version']
        );
        
        wp_enqueue_script(
            'coderscrown-crm-app',
            CODERSCROWN_CRM_PLUGIN_URL . 'build/index.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            true
        );
        
        // Localize script for React App
        wp_localize_script(
            'coderscrown-crm-app',
            'codersCrownSettings',
            array(
                'root' => esc_url_raw( rest_url( 'crm/v1/' ) ),
                'nonce' => wp_create_nonce( 'wp_rest' ),
                'adminUrl' => admin_url(),
                'currentUser' => array(
                    'id' => get_current_user_id(),
                    'display_name' => wp_get_current_user()->display_name,
                    'roles' => wp_get_current_user()->roles,
                    'caps' => array(
                        'manage_crm' => current_user_can( 'manage_crm' ),
                        'manage_crm_leads' => current_user_can( 'manage_crm_leads' ),
                        'manage_crm_projects' => current_user_can( 'manage_crm_projects' ),
                        'manage_crm_tickets' => current_user_can( 'manage_crm_tickets' ),
                    )
                )
            )
        );
    }

    /**
     * Handle CRM form submissions before headers are sent.
     */
    public function handle_admin_submissions() {
        // Handle Leads
        if ( isset( $_POST['crm_save_lead'] ) || isset( $_POST['crm_delete_lead'] ) || isset( $_POST['crm_import_csv'] ) ) {
            CRM_Leads_Admin::handle_submissions();
        }
        
        // Handle Projects
        if ( isset( $_POST['crm_save_project'] ) || isset( $_POST['crm_delete_project'] ) ) {
            CRM_Projects_Admin::handle_submissions();
        }
        
        // Handle Tickets
        if ( isset( $_POST['crm_save_ticket'] ) || isset( $_POST['crm_add_message'] ) ) {
            CRM_Tickets_Admin::handle_submissions();
        }
        
        // Handle API Keys
        if ( isset( $_POST['crm_generate_key'] ) || isset( $_POST['crm_revoke_key'] ) ) {
            CRM_API_Keys_Admin::handle_submissions();
        }
    }

    /**
     * Run the plugin.
     */
    public function run() {
        // Plugin is now running
    }
}

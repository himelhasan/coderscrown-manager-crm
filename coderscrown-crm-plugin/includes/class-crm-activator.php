<?php
/**
 * Fired during plugin activation
 *
 * @package CodersCrown_CRM
 */

class CRM_Activator {

    /**
     * Plugin activation logic
     */
    public static function activate() {
        // Create database tables
        require_once CODERSCROWN_CRM_PLUGIN_DIR . 'includes/class-crm-database.php';
        CRM_Database::create_tables();
        
        // Create custom capabilities
        self::add_capabilities();
        
        // Set default options
        add_option( 'coderscrown_crm_version', CODERSCROWN_CRM_VERSION );
        add_option( 'coderscrown_crm_activated', current_time( 'mysql' ) );
        
        // Flush rewrite rules for REST API
        flush_rewrite_rules();
    }
    
    /**
     * Add custom capabilities to administrator role
     */
    /**
     * Add custom capabilities and roles
     */
    private static function add_capabilities() {
        // Add capabilities to Administrator
        $role = get_role( 'administrator' );
        
        if ( $role ) {
            $capabilities = array(
                'manage_crm',
                'manage_crm_leads',
                'manage_crm_projects',
                'manage_crm_tickets',
                'manage_crm_api_keys',
                'view_crm_dashboard'
            );
            
            foreach ( $capabilities as $cap ) {
                $role->add_cap( $cap );
            }
        }

        // Add Client Role
        add_role(
            'client',
            __( 'Client', 'coderscrown-crm' ),
            array(
                'read' => true,
                'view_crm_dashboard' => true,
                'view_own_projects' => true,
                'view_own_tickets' => true,
                'create_tickets' => true,
                // Clients cannot delete tickets or manage leads/api keys
            )
        );
    }
}

<?php
/**
 * API Keys Administration
 *
 * @package CodersCrown_CRM
 */

class CRM_API_Keys_Admin {

    /**
     * Handle form submissions
     */
    public static function handle_submissions() {
        $action = isset( $_POST['crm_action'] ) ? sanitize_text_field( $_POST['crm_action'] ) : '';
        
        if ( 'generate_api_key' === $action && check_admin_referer( 'crm_generate_key' ) ) {
            self::generate_api_key();
        }
        
        if ( 'revoke_api_key' === $action && check_admin_referer( 'crm_revoke_key' ) ) {
            self::revoke_api_key();
        }
    }

    /**
     * Display admin notices
     */
    public static function display_notices() {
        if ( isset( $_GET['message'] ) ) {
            $message = sanitize_text_field( $_GET['message'] );
            $notices = array(
                'generated' => __( 'API Key generated successfully.', 'coderscrown-crm' ),
                'revoked' => __( 'API Key revoked successfully.', 'coderscrown-crm' )
            );
            
            if ( isset( $notices[ $message ] ) ) {
                echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( $notices[ $message ] ) . '</p></div>';
            }
            
            if ( $message === 'generated' && isset( $_GET['api_key'] ) ) {
                echo '<div class="notice notice-info"><p>' . sprintf(
                    __( 'Your new API Key: %s', 'coderscrown-crm' ),
                    '<code>' . esc_html( sanitize_text_field( $_GET['api_key'] ) ) . '</code>'
                ) . '<br><strong>' . __( 'Important: Save this key now! You will not be able to see it again.', 'coderscrown-crm' ) . '</strong></p></div>';
            }
        }
    }
    
    /**
     * Render API keys page
     */
    public static function render_api_keys_page() {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_api_keys';
        
        // Display notices
        self::display_notices();
        
        $api_keys = $wpdb->get_results( "SELECT * FROM $table ORDER BY createdAt DESC" );
        
        require_once CODERSCROWN_CRM_PLUGIN_DIR . 'admin/views/api-keys.php';
    }

    /**
     * Generate new API key
     */
    private static function generate_api_key() {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_api_keys';
        
        $name = isset( $_POST['key_name'] ) ? sanitize_text_field( $_POST['key_name'] ) : '';
        $api_key = CRM_Helpers::generate_api_key();
        
        $result = $wpdb->insert( $table, array(
            'name' => $name,
            'api_key' => $api_key,
            'is_active' => 1
        ) );
        
        if ( $result ) {
            wp_redirect( add_query_arg( array( 'page' => 'crm-api-keys', 'message' => 'generated', 'api_key' => $api_key ), admin_url( 'admin.php' ) ) );
            exit;
        }
    }

    /**
     * Revoke API key
     */
    private static function revoke_api_key() {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_api_keys';
        
        $key_id = isset( $_POST['key_id'] ) ? absint( $_POST['key_id'] ) : 0;
        
        if ( $key_id ) {
            $result = $wpdb->update( $table, array( 'is_active' => 0 ), array( 'id' => $key_id ) );
            if ( $result !== false ) {
                wp_redirect( add_query_arg( array( 'page' => 'crm-api-keys', 'message' => 'revoked' ), admin_url( 'admin.php' ) ) );
                exit;
            }
        }
    }
}

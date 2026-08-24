<?php
/**
 * API Authentication for N8N Integration
 *
 * @package CodersCrown_CRM
 */

class CRM_API_Authentication {

    /**
     * Validate API key from request header
     */
    public static function validate_api_key( $request ) {
        $auth_header = $request->get_header( 'Authorization' );
        
        if ( empty( $auth_header ) ) {
            return new WP_Error(
                'missing_auth',
                __( 'Authorization header is missing', 'coderscrown-crm' ),
                array( 'status' => 401 )
            );
        }
        
        // Extract Bearer token
        if ( ! preg_match( '/Bearer\s+(.*)$/i', $auth_header, $matches ) ) {
            return new WP_Error(
                'invalid_auth_format',
                __( 'Invalid authorization format. Use: Bearer sk_xxxxx', 'coderscrown-crm' ),
                array( 'status' => 401 )
            );
        }
        
        $api_key = $matches[1];
        
        // Validate API key against database
        global $wpdb;
        $table = $wpdb->prefix . 'crm_api_keys';
        
        $key_data = $wpdb->get_row( $wpdb->prepare(
            "SELECT * FROM $table WHERE api_key = %s AND is_active = 1",
            $api_key
        ) );
        
        if ( ! $key_data ) {
            return new WP_Error(
                'invalid_api_key',
                __( 'Invalid or inactive API key', 'coderscrown-crm' ),
                array( 'status' => 401 )
            );
        }
        
        // Update last used timestamp
        $wpdb->update(
            $table,
            array( 'last_used' => current_time( 'mysql' ) ),
            array( 'id' => $key_data->id )
        );
        
        return true;
    }

    /**
     * Permission callback for REST API endpoints
     */
    public static function check_api_permission( $request ) {
        // Allow logged-in users with a valid nonce
        if ( is_user_logged_in() && check_ajax_referer( 'wp_rest', '_wpnonce', false ) ) {
            return true;
        }

        // Fallback to API Key authentication
        $result = self::validate_api_key( $request );
        
        if ( is_wp_error( $result ) ) {
            return $result;
        }
        
        return true;
    }
}

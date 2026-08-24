<?php
/**
 * Leads Administration
 *
 * @package CodersCrown_CRM
 */

class CRM_Leads_Admin {

    /**
     * Render leads page
     */
    public static function render_leads_page() {
        if ( isset( $_GET['action'] ) && 'import' === $_GET['action'] ) {
            include CODERSCROWN_CRM_PLUGIN_DIR . 'admin/views/leads-import.php';
        } else {
            echo '<div id="coderscrown-crm-root"></div>';
        }
    }

    /**
     * Render leads list
     */
    private static function render_leads_list() {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_leads';
        
        // Get filter parameters
        $status_filter = isset( $_GET['status'] ) ? sanitize_text_field( $_GET['status'] ) : '';
        $search = isset( $_GET['s'] ) ? sanitize_text_field( $_GET['s'] ) : '';
        
        // Build query
        $where = array( '1=1' );
        $params = array();
        
        if ( $status_filter ) {
            $where[] = 'status = %s';
            $params[] = $status_filter;
        }
        
        if ( $search ) {
            $where[] = '(name LIKE %s OR email LIKE %s OR company_name LIKE %s)';
            $search_term = '%' . $wpdb->esc_like( $search ) . '%';
            $params[] = $search_term;
            $params[] = $search_term;
            $params[] = $search_term;
        }
        
        $sql = "SELECT * FROM $table WHERE " . implode( ' AND ', $where ) . " ORDER BY createdAt DESC";
        
        if ( ! empty( $params ) ) {
            $sql = $wpdb->prepare( $sql, $params );
        }
        
        $leads = $wpdb->get_results( $sql );
        $total_count = $wpdb->get_var( "SELECT COUNT(*) FROM $table" );
        
        include CODERSCROWN_CRM_PLUGIN_DIR . 'admin/views/leads-list.php';
    }

    /**
     * Save lead (create or update)
     */
    private static function save_lead() {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_leads';
        
        $lead_id = isset( $_POST['lead_id'] ) ? absint( $_POST['lead_id'] ) : 0;
        $data = CRM_Security::sanitize_lead_data( $_POST );
        
        if ( $lead_id ) {
            // Update existing lead
            $result = $wpdb->update( $table, $data, array( 'id' => $lead_id ) );
            if ( $result !== false ) {
                wp_redirect( add_query_arg( array( 'page' => 'crm-leads', 'message' => 'updated' ), admin_url( 'admin.php' ) ) );
                exit;
            } else {
                echo '<div class="notice notice-error"><p>' . esc_html__( 'Failed to update lead.', 'coderscrown-crm' ) . '</p></div>';
            }
        } else {
            // Create new lead
            $result = $wpdb->insert( $table, $data );
            if ( $result ) {
                wp_redirect( add_query_arg( array( 'page' => 'crm-leads', 'message' => 'created' ), admin_url( 'admin.php' ) ) );
                exit;
            } else {
                echo '<div class="notice notice-error"><p>' . esc_html__( 'Failed to create lead.', 'coderscrown-crm' ) . '</p></div>';
            }
        }
    }

    /**
     * Delete lead
     */
    private static function delete_lead() {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_leads';
        
        $lead_id = isset( $_POST['lead_id'] ) ? absint( $_POST['lead_id'] ) : 0;
        
        if ( $lead_id ) {
            $result = $wpdb->delete( $table, array( 'id' => $lead_id ) );
            if ( $result ) {
                wp_redirect( add_query_arg( array( 'page' => 'crm-leads', 'message' => 'deleted' ), admin_url( 'admin.php' ) ) );
                exit;
            } else {
                echo '<div class="notice notice-error"><p>' . esc_html__( 'Failed to delete lead.', 'coderscrown-crm' ) . '</p></div>';
            }
        }
    }
    
    /**
     * Display admin notices
     */

    /**
     * Handle form submissions
     */
    public static function handle_submissions() {
        $action = isset( $_POST['crm_action'] ) ? sanitize_text_field( $_POST['crm_action'] ) : '';
        
        if ( 'save_lead' === $action && check_admin_referer( 'crm_save_lead' ) ) {
            self::save_lead();
        }
        
        if ( 'delete_lead' === $action && check_admin_referer( 'crm_save_lead' ) ) {
            self::delete_lead();
        }
        
        if ( 'import_csv' === $action && check_admin_referer( 'crm_import_csv' ) ) {
            CRM_CSV_Importer::import_leads();
        }
    }
    
    /**
     * Update lead status via AJAX
     */
    public static function update_lead_status() {
        CRM_Security::verify_ajax_nonce();
        
        if ( ! current_user_can( 'manage_crm_leads' ) ) {
            wp_send_json_error( array( 'message' => 'Insufficient permissions' ), 403 );
        }
        
        global $wpdb;
        $table = $wpdb->prefix . 'crm_leads';
        
        $lead_id = isset( $_POST['lead_id'] ) ? absint( $_POST['lead_id'] ) : 0;
        $status = isset( $_POST['status'] ) ? sanitize_text_field( $_POST['status'] ) : '';
        
        if ( $lead_id && $status ) {
            $result = $wpdb->update( 
                $table, 
                array( 'status' => $status ), 
                array( 'id' => $lead_id ),
                array( '%s' ),
                array( '%d' )
            );
            
            if ( $result !== false ) {
                wp_send_json_success( array( 'message' => 'Status updated successfully' ) );
            } else {
                wp_send_json_error( array( 'message' => 'Failed to update status' ) );
            }
        }
        
        wp_send_json_error( array( 'message' => 'Invalid parameters' ) );
    }

    public static function display_notices() {
        if ( isset( $_GET['message'] ) ) {
            $message = sanitize_text_field( $_GET['message'] );
            $notices = array(
                'created' => __( 'Lead created successfully.', 'coderscrown-crm' ),
                'updated' => __( 'Lead updated successfully.', 'coderscrown-crm' ),
                'deleted' => __( 'Lead deleted successfully.', 'coderscrown-crm' )
            );
            
            if ( isset( $notices[ $message ] ) ) {
                echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( $notices[ $message ] ) . '</p></div>';
            }
        }
    }
}
 
// Register AJAX action
add_action( 'wp_ajax_crm_update_lead_status', array( 'CRM_Leads_Admin', 'update_lead_status' ) );

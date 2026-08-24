<?php
/**
 * Tickets Administration
 *
 * @package CodersCrown_CRM
 */

class CRM_Tickets_Admin {

    /**
     * Render tickets page
     */
    public static function render_tickets_page() {
        echo '<div id="coderscrown-crm-root"></div>';
    }

    /**
     * Render tickets list
     */
    /**
     * Render tickets list
     */
    private static function render_tickets_list() {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_tickets';
        
        $where = '1=1';
        $params = array();
        
        // Filter by Client if user is a client
        if ( current_user_can( 'client' ) && ! current_user_can( 'administrator' ) ) {
            $where .= ' AND client_id = %d';
            $params[] = get_current_user_id();
        }
        
        $sql = "SELECT * FROM $table WHERE $where ORDER BY updatedAt DESC";
        
        if ( ! empty( $params ) ) {
            $sql = $wpdb->prepare( $sql, $params );
        }
        
        $tickets = $wpdb->get_results( $sql );
        $total_count = $wpdb->get_var( "SELECT COUNT(*) FROM $table" );
        
        include CODERSCROWN_CRM_PLUGIN_DIR . 'admin/views/tickets-list.php';
    }

    /**
     * Render ticket detail with messages
     */
    private static function render_ticket_detail( $ticket_id ) {
        global $wpdb;
        $tickets_table = $wpdb->prefix . 'crm_tickets';
        $messages_table = $wpdb->prefix . 'crm_ticket_messages';
        
        // Check if client can view this ticket
        if ( current_user_can( 'client' ) && ! current_user_can( 'administrator' ) ) {
            $ticket_owner = $wpdb->get_var( $wpdb->prepare( "SELECT client_id FROM $tickets_table WHERE id = %d", $ticket_id ) );
            if ( $ticket_owner != get_current_user_id() ) {
                wp_die( __( 'You do not have permission to view this ticket.', 'coderscrown-crm' ) );
            }
        }
        
        $ticket = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM $tickets_table WHERE id = %d", $ticket_id ) );
        $messages = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $messages_table WHERE ticket_id = %d ORDER BY createdAt ASC", $ticket_id ) );
        
        include CODERSCROWN_CRM_PLUGIN_DIR . 'admin/views/ticket-detail.php';
    }

    /**
     * Save ticket
     */
    private static function save_ticket() {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_tickets';
        
        $data = CRM_Security::sanitize_ticket_data( $_POST );
        
        // Force client_id for clients
        if ( current_user_can( 'client' ) && ! current_user_can( 'administrator' ) ) {
            $data['client_id'] = get_current_user_id();
        }
        
        $result = $wpdb->insert( $table, $data );
        
        if ( $result ) {
            wp_redirect( add_query_arg( array( 'page' => 'crm-tickets', 'message' => 'created' ), admin_url( 'admin.php' ) ) );
            exit;
        }
    }

    /**
     * Delete ticket
     */
    private static function delete_ticket() {
        if ( ! current_user_can( 'administrator' ) ) {
            wp_die( __( 'You do not have permission to delete tickets.', 'coderscrown-crm' ) );
        }

        global $wpdb;
        $table = $wpdb->prefix . 'crm_tickets';
        
        $ticket_id = isset( $_POST['ticket_id'] ) ? absint( $_POST['ticket_id'] ) : 0;
        
        if ( $ticket_id ) {
            $result = $wpdb->delete( $table, array( 'id' => $ticket_id ) );
            if ( $result ) {
                wp_redirect( add_query_arg( array( 'page' => 'crm-tickets', 'message' => 'deleted' ), admin_url( 'admin.php' ) ) );
                exit;
            }
        }
    }

    /**
     * Add message to ticket
     */
    private static function add_message() {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_ticket_messages';
        
        $ticket_id = isset( $_POST['ticket_id'] ) ? absint( $_POST['ticket_id'] ) : 0;
        $content = isset( $_POST['message_content'] ) ? sanitize_textarea_field( $_POST['message_content'] ) : '';
        
        if ( $ticket_id && $content ) {
            $result = $wpdb->insert( $table, array(
                'ticket_id' => $ticket_id,
                'sender_id' => get_current_user_id(),
                'content' => $content
            ) );
            
            if ( $result ) {
                wp_redirect( add_query_arg( array( 'page' => 'crm-tickets', 'action' => 'view', 'ticket_id' => $ticket_id, 'message' => 'message_added' ), admin_url( 'admin.php' ) ) );
                exit;
            }
        }
    }
    
    /**
     * Handle form submissions
     */
    public static function handle_submissions() {
        $action = isset( $_POST['crm_action'] ) ? sanitize_text_field( $_POST['crm_action'] ) : '';
        
        if ( 'save_ticket' === $action && check_admin_referer( 'crm_save_ticket' ) ) {
            self::save_ticket();
        }
        
        if ( 'add_message' === $action && check_admin_referer( 'crm_add_message' ) ) {
            self::add_message();
        }

        if ( 'delete_ticket' === $action && check_admin_referer( 'crm_delete_ticket' ) ) {
            self::delete_ticket();
        }
    }
    
    public static function display_notices() {
        if ( isset( $_GET['message'] ) ) {
            $message = sanitize_text_field( $_GET['message'] );
            $notices = array(
                'created' => __( 'Ticket created successfully.', 'coderscrown-crm' ),
                'message_added' => __( 'Message added successfully.', 'coderscrown-crm' ),
                'deleted' => __( 'Ticket deleted successfully.', 'coderscrown-crm' )
            );
            
            if ( isset( $notices[ $message ] ) ) {
                echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( $notices[ $message ] ) . '</p></div>';
            }
        }
    }
}

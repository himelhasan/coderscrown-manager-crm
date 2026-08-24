<?php
/**
 * REST API Controller for N8N Integration
 *
 * @package CodersCrown_CRM
 */

class CRM_REST_Controller {

    /**
     * Register REST API routes
     */
    public static function register_routes() {
        $namespace = 'crm/v1';
        
        // Leads Routes
        register_rest_route( $namespace, '/leads', array(
            'methods' => 'GET',
            'callback' => array( __CLASS__, 'get_leads' ),
            'permission_callback' => array( 'CRM_API_Authentication', 'check_api_permission' ),
            'args' => array(
                'status' => array( 'required' => false, 'type' => 'string' ),
                'tags' => array( 'required' => false, 'type' => 'string' )
            )
        ) );
        
        register_rest_route( $namespace, '/leads/(?P<id>\d+)', array(
            'methods' => 'GET',
            'callback' => array( __CLASS__, 'get_lead' ),
            'permission_callback' => array( 'CRM_API_Authentication', 'check_api_permission' )
        ) );
        
        register_rest_route( $namespace, '/leads', array(
            'methods' => 'POST',
            'callback' => array( __CLASS__, 'create_lead' ),
            'permission_callback' => array( 'CRM_API_Authentication', 'check_api_permission' )
        ) );
        
        register_rest_route( $namespace, '/leads/(?P<id>\d+)', array(
            'methods' => 'PUT',
            'callback' => array( __CLASS__, 'update_lead' ),
            'permission_callback' => array( 'CRM_API_Authentication', 'check_api_permission' )
        ) );
        
        register_rest_route( $namespace, '/leads/bulk', array(
            'methods' => 'POST',
            'callback' => array( __CLASS__, 'bulk_update_leads' ),
            'permission_callback' => array( 'CRM_API_Authentication', 'check_api_permission' )
        ) );

        register_rest_route( $namespace, '/leads/(?P<id>\d+)/outreach-history', array(
            'methods' => 'POST',
            'callback' => array( __CLASS__, 'log_outreach' ),
            'permission_callback' => array( 'CRM_API_Authentication', 'check_api_permission' )
        ) );
        
        register_rest_route( $namespace, '/leads/(?P<id>\d+)/schedule-followup', array(
            'methods' => 'POST',
            'callback' => array( __CLASS__, 'schedule_followup' ),
            'permission_callback' => array( 'CRM_API_Authentication', 'check_api_permission' )
        ) );

        // Projects Routes
        register_rest_route( $namespace, '/projects', array(
            'methods' => 'GET',
            'callback' => array( __CLASS__, 'get_projects' ),
            'permission_callback' => array( 'CRM_API_Authentication', 'check_api_permission' )
        ) );

        register_rest_route( $namespace, '/projects/bulk', array(
            'methods' => 'POST',
            'callback' => array( __CLASS__, 'bulk_update_projects' ),
            'permission_callback' => array( 'CRM_API_Authentication', 'check_api_permission' )
        ) );

        // Tickets Routes
        register_rest_route( $namespace, '/tickets', array(
            'methods' => 'GET',
            'callback' => array( __CLASS__, 'get_tickets' ),
            'permission_callback' => array( 'CRM_API_Authentication', 'check_api_permission' )
        ) );
        
         register_rest_route( $namespace, '/tickets/bulk', array(
            'methods' => 'POST',
            'callback' => array( __CLASS__, 'bulk_update_tickets' ),
            'permission_callback' => array( 'CRM_API_Authentication', 'check_api_permission' )
        ) );
    }

    /**
     * Get leads with optional filtering
     */
    public static function get_leads( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_leads';
        
        $where = array( '1=1' );
        $params = array();
        
        // Filter by status
        if ( $request->get_param( 'status' ) ) {
            $where[] = 'status = %s';
            $params[] = $request->get_param( 'status' );
        }
        
        // Filter by tags
        if ( $request->get_param( 'tags' ) ) {
            $where[] = 'tags LIKE %s';
            $params[] = '%' . $wpdb->esc_like( $request->get_param( 'tags' ) ) . '%';
        }
        
        $sql = "SELECT * FROM $table WHERE " . implode( ' AND ', $where ) . " ORDER BY createdAt DESC";
        
        if ( ! empty( $params ) ) {
            $sql = $wpdb->prepare( $sql, $params );
        }
        
        $leads = $wpdb->get_results( $sql );
        
        // Format leads
        $formatted_leads = array_map( array( __CLASS__, 'format_lead' ), $leads );
        
        return rest_ensure_response( $formatted_leads );
    }

    /**
     * Get single lead
     */
    public static function get_lead( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_leads';
        $id = $request->get_param( 'id' );
        
        $lead = $wpdb->get_row( $wpdb->prepare(
            "SELECT * FROM $table WHERE id = %d",
            $id
        ) );
        
        if ( ! $lead ) {
            return new WP_Error(
                'lead_not_found',
                __( 'Lead not found', 'coderscrown-crm' ),
                array( 'status' => 404 )
            );
        }
        
        return rest_ensure_response( self::format_lead( $lead ) );
    }

    /**
     * Create new lead
     */
    public static function create_lead( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_leads';
        
        $data = $request->get_json_params();
        $sanitized = CRM_Security::sanitize_lead_data( $data );
        
        $result = $wpdb->insert( $table, $sanitized );
        
        if ( ! $result ) {
            return new WP_Error(
                'create_failed',
                __( 'Failed to create lead', 'coderscrown-crm' ),
                array( 'status' => 500 )
            );
        }
        
        $lead = $wpdb->get_row( $wpdb->prepare(
            "SELECT * FROM $table WHERE id = %d",
            $wpdb->insert_id
        ) );
        
        return rest_ensure_response( self::format_lead( $lead ) );
    }

    /**
     * Update lead
     */
    public static function update_lead( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_leads';
        $id = $request->get_param( 'id' );
        
        $data = $request->get_json_params();
        $sanitized = CRM_Security::sanitize_lead_data( $data );
        
        $result = $wpdb->update(
            $table,
            $sanitized,
            array( 'id' => $id )
        );
        
        if ( $result === false ) {
            return new WP_Error(
                'update_failed',
                __( 'Failed to update lead', 'coderscrown-crm' ),
                array( 'status' => 500 )
            );
        }
        
        $lead = $wpdb->get_row( $wpdb->prepare(
            "SELECT * FROM $table WHERE id = %d",
            $id
        ) );
        
        return rest_ensure_response( self::format_lead( $lead ) );
    }

    /**
     * Log outreach history (unlocks cold outreach fields in UI)
     */
    public static function log_outreach( $request ) {
        global $wpdb;
        $lead_id = $request->get_param( 'id' );
        $data = $request->get_json_params();
        
        // Insert into outreach logs
        $logs_table = $wpdb->prefix . 'crm_outreach_logs';
        $wpdb->insert( $logs_table, array(
            'lead_id' => $lead_id,
            'email_subject' => isset( $data['email_subject'] ) ? sanitize_text_field( $data['email_subject'] ) : '',
            'email_body' => isset( $data['email_body'] ) ? sanitize_textarea_field( $data['email_body'] ) : '',
            'status' => isset( $data['status'] ) ? sanitize_text_field( $data['status'] ) : 'sent',
            'outreach_type' => isset( $data['outreach_type'] ) ? sanitize_text_field( $data['outreach_type'] ) : 'first_email',
            'sent_date' => current_time( 'mysql' )
        ) );
        
        // Update lead's cold outreach data
        $leads_table = $wpdb->prefix . 'crm_leads';
        $update_data = array();
        
        // If this is the first email, set first_email_sent_date
        if ( isset( $data['outreach_type'] ) && $data['outreach_type'] === 'first_email' ) {
            $update_data['cold_outreach_first_email_sent_date'] = current_time( 'mysql' );
        }
        
        $update_data['cold_outreach_last_outreach_date'] = current_time( 'mysql' );
        
        if ( isset( $data['campaign_name'] ) ) {
            $update_data['cold_outreach_campaign_name'] = sanitize_text_field( $data['campaign_name'] );
        }
        
        if ( isset( $data['campaign_status'] ) ) {
            $update_data['cold_outreach_campaign_status'] = sanitize_text_field( $data['campaign_status'] );
        }
        
        $wpdb->update(
            $leads_table,
            $update_data,
            array( 'id' => $lead_id )
        );
        
        return rest_ensure_response( array(
            'success' => true,
            'message' => __( 'Outreach logged successfully', 'coderscrown-crm' )
        ) );
    }

    /**
     * Schedule follow-up for lead
     */
    public static function schedule_followup( $request ) {
        global $wpdb;
        $lead_id = $request->get_param( 'id' );
        $data = $request->get_json_params();
        
        $leads_table = $wpdb->prefix . 'crm_leads';
        $update_data = array();
        
        if ( isset( $data['next_followup_date'] ) ) {
            $update_data['cold_outreach_next_followup_date'] = sanitize_text_field( $data['next_followup_date'] );
        }
        
        if ( isset( $data['followup_interval'] ) ) {
            $update_data['cold_outreach_followup_interval'] = sanitize_text_field( $data['followup_interval'] );
        }
        
        // Increment sequence number
        $wpdb->query( $wpdb->prepare(
            "UPDATE $leads_table SET cold_outreach_followup_sequence_number = cold_outreach_followup_sequence_number + 1 WHERE id = %d",
            $lead_id
        ) );
        
        if ( ! empty( $update_data ) ) {
            $wpdb->update(
                $leads_table,
                $update_data,
                array( 'id' => $lead_id )
            );
        }
        
        return rest_ensure_response( array(
            'success' => true,
            'message' => __( 'Follow-up scheduled successfully', 'coderscrown-crm' )
        ) );
    }

    /**
     * Get projects
     */
    public static function get_projects( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_projects';
        
        $where = array( '1=1' );
        $params = array();
        
        // Role check
        if ( current_user_can( 'client' ) && ! current_user_can( 'administrator' ) ) {
            $where[] = 'client_id = %d';
            $params[] = get_current_user_id();
        }
        
        if ( $request->get_param( 'status' ) ) {
            $where[] = 'status = %s';
            $params[] = $request->get_param( 'status' );
        }
        
        $sql = "SELECT * FROM $table WHERE " . implode( ' AND ', $where ) . " ORDER BY updatedAt DESC";
        
        if ( ! empty( $params ) ) {
            $sql = $wpdb->prepare( $sql, $params );
        }
        
        $projects = $wpdb->get_results( $sql );
        
        return rest_ensure_response( $projects );
    }

    /**
     * Get tickets
     */
    public static function get_tickets( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_tickets';
        
        $where = array( '1=1' );
        $params = array();
        
        // Role check
        if ( current_user_can( 'client' ) && ! current_user_can( 'administrator' ) ) {
            $where[] = 'client_id = %d';
            $params[] = get_current_user_id();
        }
        
        $sql = "SELECT * FROM $table WHERE " . implode( ' AND ', $where ) . " ORDER BY updatedAt DESC";
        
        if ( ! empty( $params ) ) {
            $sql = $wpdb->prepare( $sql, $params );
        }
        
        $tickets = $wpdb->get_results( $sql );
        
        return rest_ensure_response( $tickets );
    }
    
    /**
     * Bulk update leads
     */
    public static function bulk_update_leads( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_leads';
        $params = $request->get_json_params();
        $ids = isset( $params['ids'] ) ? array_map( 'absint', $params['ids'] ) : array();
        $action = isset( $params['action'] ) ? sanitize_text_field( $params['action'] ) : ''; // delete
        
        if ( empty( $ids ) ) {
            return new WP_Error( 'no_ids', 'No IDs provided', array( 'status' => 400 ) );
        }
        
        if ( 'delete' === $action ) {
            // Check capability
            if ( ! current_user_can( 'manage_crm_leads' ) ) {
                return new WP_Error( 'forbidden', 'Insufficient permissions', array( 'status' => 403 ) );
            }
            
            $ids_placeholder = implode( ',', array_fill( 0, count( $ids ), '%d' ) );
            $wpdb->query( $wpdb->prepare( "DELETE FROM $table WHERE id IN ($ids_placeholder)", $ids ) );
            
            return rest_ensure_response( array( 'success' => true, 'message' => 'Leads deleted' ) );
        }

        return new WP_Error( 'invalid_action', 'Invalid action', array( 'status' => 400 ) );
    }

    /**
     * Bulk update projects
     */
    public static function bulk_update_projects( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_projects';
        $params = $request->get_json_params();
        $ids = isset( $params['ids'] ) ? array_map( 'absint', $params['ids'] ) : array();
        $action = isset( $params['action'] ) ? sanitize_text_field( $params['action'] ) : ''; 
        $status = isset( $params['status'] ) ? sanitize_text_field( $params['status'] ) : '';

        if ( empty( $ids ) ) {
            return new WP_Error( 'no_ids', 'No IDs provided', array( 'status' => 400 ) );
        }
        
        $ids_placeholder = implode( ',', array_fill( 0, count( $ids ), '%d' ) );

        // Delete Action
        if ( 'delete' === $action ) {
            if ( ! current_user_can( 'manage_crm_projects' ) ) {
                return new WP_Error( 'forbidden', 'Insufficient permissions', array( 'status' => 403 ) );
            }
            $wpdb->query( $wpdb->prepare( "DELETE FROM $table WHERE id IN ($ids_placeholder)", $ids ) );
            return rest_ensure_response( array( 'success' => true, 'message' => 'Projects deleted' ) );
        }
        
        // Status Update Action
        if ( 'update_status' === $action && ! empty( $status ) ) {
            // Check if user can edit these projects. 
            // Admins can edit all. Clients can only edit their own? 
            // Usually only admins change status to "Approved", but maybe Clients can change to "Completed"?
            // For now, let's allow anyone with access to projects key capability or if they own it.
            // But strict bulk edit usually implies higher privs. Let's stick to 'manage_crm_projects' for now for simplicity, 
            // or we might need complex per-ID checks.
            
             if ( ! current_user_can( 'manage_crm_projects' ) ) {
                 // If not admin/manager, check ownership for each? Too expensive for bulk.
                 // Let's restrict bulk status update to Managers for now.
                return new WP_Error( 'forbidden', 'Insufficient permissions', array( 'status' => 403 ) );
            }

            $wpdb->query( $wpdb->prepare( "UPDATE $table SET status = %s WHERE id IN ($ids_placeholder)", array_merge( array( $status ), $ids ) ) );
            return rest_ensure_response( array( 'success' => true, 'message' => 'Projects status updated' ) );
        }

        return new WP_Error( 'invalid_action', 'Invalid action', array( 'status' => 400 ) );
    }
    
    /**
     * Bulk update tickets
     */
    public static function bulk_update_tickets( $request ) {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_tickets';
        $params = $request->get_json_params();
        $ids = isset( $params['ids'] ) ? array_map( 'absint', $params['ids'] ) : array();
        $action = isset( $params['action'] ) ? sanitize_text_field( $params['action'] ) : '';
        $status = isset( $params['status'] ) ? sanitize_text_field( $params['status'] ) : '';

        if ( empty( $ids ) ) {
            return new WP_Error( 'no_ids', 'No IDs provided', array( 'status' => 400 ) );
        }
        
        $ids_placeholder = implode( ',', array_fill( 0, count( $ids ), '%d' ) );

        // Delete Action (Admin Only)
        if ( 'delete' === $action ) {
            if ( ! current_user_can( 'administrator' ) ) { // Strict check for tickets as per req
                return new WP_Error( 'forbidden', 'Insufficient permissions', array( 'status' => 403 ) );
            }
            $wpdb->query( $wpdb->prepare( "DELETE FROM $table WHERE id IN ($ids_placeholder)", $ids ) );
            return rest_ensure_response( array( 'success' => true, 'message' => 'Tickets deleted' ) );
        }

        // Status Update (Admins + maybe Clients?)
        if ( 'update_status' === $action && ! empty( $status ) ) {
             // Clients can close their own tickets? For bulk, let's keep it simple: manage_crm_tickets (Admins/Support)
             if ( ! current_user_can( 'manage_crm_tickets' ) ) {
                 // For clients, we might want to allow this if all IDs belong to them.
                 // For now, restrict bulk to defaults.
                return new WP_Error( 'forbidden', 'Insufficient permissions', array( 'status' => 403 ) );
            }

            $wpdb->query( $wpdb->prepare( "UPDATE $table SET status = %s WHERE id IN ($ids_placeholder)", array_merge( array( $status ), $ids ) ) );
            return rest_ensure_response( array( 'success' => true, 'message' => 'Tickets status updated' ) );
        }

         return new WP_Error( 'invalid_action', 'Invalid action', array( 'status' => 400 ) );
    }

    /**
     * Format lead data for API response
     */
    private static function format_lead( $lead ) {
        return array(
            'id' => (int) $lead->id,
            '_id' => (int) $lead->id,
            'name' => $lead->name,
            'email' => $lead->email,
            'phone' => $lead->phone,
            'address' => $lead->address,
            'website' => $lead->website,
            'facebook_link' => $lead->facebook_link,
            'fb_personal_link' => $lead->fb_personal_link,
            'fb_page_link' => $lead->fb_page_link,
            'instagram_link' => $lead->instagram_link,
            'linkedin_link' => $lead->linkedin_link,
            'linkedin_company' => $lead->linkedin_company,
            'company_name' => $lead->company_name,
            'industry' => $lead->industry,
            'company_size' => $lead->company_size,
            'position' => $lead->position,
            'best_contact_time' => $lead->best_contact_time,
            'source' => $lead->source,
            'status' => $lead->status,
            'tags' => ! empty( $lead->tags ) ? explode( ',', $lead->tags ) : array(),
            'notes' => $lead->notes,
            'cold_outreach' => array(
                'first_email_sent_date' => $lead->cold_outreach_first_email_sent_date,
                'last_outreach_date' => $lead->cold_outreach_last_outreach_date,
                'next_followup_date' => $lead->cold_outreach_next_followup_date,
                'followup_interval' => $lead->cold_outreach_followup_interval,
                'followup_sequence_number' => (int) $lead->cold_outreach_followup_sequence_number,
                'campaign_name' => $lead->cold_outreach_campaign_name,
                'campaign_status' => $lead->cold_outreach_campaign_status,
                'response_status' => $lead->cold_outreach_response_status,
                'last_followup_sent_date' => $lead->cold_outreach_last_followup_sent_date,
                'automated_followups_scheduled' => (int) $lead->cold_outreach_automated_followups_scheduled
            ),
            'createdAt' => $lead->createdAt,
            'updatedAt' => $lead->updatedAt
        );
    }
}

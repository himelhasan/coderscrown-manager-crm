<?php
/**
 * Security utilities for the CRM plugin
 *
 * @package CodersCrown_CRM
 */

class CRM_Security {

    /**
     * Verify nonce for AJAX requests
     */
    public static function verify_ajax_nonce() {
        if ( ! isset( $_POST['nonce'] ) || ! wp_verify_nonce( $_POST['nonce'], 'crm_ajax_nonce' ) ) {
            wp_send_json_error( array( 'message' => 'Invalid nonce' ), 403 );
            wp_die();
        }
    }

    /**
     * Check if user has required capability
     */
    public static function check_capability( $capability ) {
        if ( ! current_user_can( $capability ) ) {
            wp_send_json_error( array( 'message' => 'Insufficient permissions' ), 403 );
            wp_die();
        }
    }

    /**
     * Sanitize lead data
     */
    public static function sanitize_lead_data( $data ) {
        return array(
            'name' => isset( $data['name'] ) ? sanitize_text_field( $data['name'] ) : '',
            'email' => isset( $data['email'] ) ? sanitize_email( $data['email'] ) : '',
            'phone' => isset( $data['phone'] ) ? sanitize_text_field( $data['phone'] ) : '',
            'address' => isset( $data['address'] ) ? sanitize_textarea_field( $data['address'] ) : '',
            'website' => isset( $data['website'] ) ? esc_url_raw( $data['website'] ) : '',
            'facebook_link' => isset( $data['facebook_link'] ) ? esc_url_raw( $data['facebook_link'] ) : '',
            'fb_personal_link' => isset( $data['fb_personal_link'] ) ? esc_url_raw( $data['fb_personal_link'] ) : '',
            'fb_page_link' => isset( $data['fb_page_link'] ) ? esc_url_raw( $data['fb_page_link'] ) : '',
            'instagram_link' => isset( $data['instagram_link'] ) ? esc_url_raw( $data['instagram_link'] ) : '',
            'linkedin_link' => isset( $data['linkedin_link'] ) ? esc_url_raw( $data['linkedin_link'] ) : '',
            'linkedin_company' => isset( $data['linkedin_company'] ) ? sanitize_text_field( $data['linkedin_company'] ) : '',
            'company_name' => isset( $data['company_name'] ) ? sanitize_text_field( $data['company_name'] ) : '',
            'industry' => isset( $data['industry'] ) ? sanitize_text_field( $data['industry'] ) : '',
            'company_size' => isset( $data['company_size'] ) ? sanitize_text_field( $data['company_size'] ) : '',
            'position' => isset( $data['position'] ) ? sanitize_text_field( $data['position'] ) : '',
            'best_contact_time' => isset( $data['best_contact_time'] ) ? sanitize_text_field( $data['best_contact_time'] ) : '',
            'source' => isset( $data['source'] ) ? sanitize_text_field( $data['source'] ) : '',
            'status' => isset( $data['status'] ) ? sanitize_text_field( $data['status'] ) : 'new',
            'tags' => isset( $data['tags'] ) ? sanitize_text_field( $data['tags'] ) : '',
            'notes' => isset( $data['notes'] ) ? sanitize_textarea_field( $data['notes'] ) : '',
        );

        // Update outreach fields only if present in input (prevents overwriting with defaults during normal edits)
        $outreach_fields = array(
            'cold_outreach_followup_interval' => 'sanitize_text_field',
            'cold_outreach_campaign_name' => 'sanitize_text_field',
            'cold_outreach_campaign_status' => 'sanitize_text_field',
            'cold_outreach_response_status' => 'sanitize_text_field',
            'cold_outreach_followup_sequence_number' => 'intval',
            'cold_outreach_automated_followups_scheduled' => 'intval',
        );

        foreach ( $outreach_fields as $field => $sanitizer ) {
            if ( isset( $data[ $field ] ) ) {
                $sanitized[ $field ] = $sanitizer( $data[ $field ] );
            }
        }

        return $sanitized;
    }

    /**
     * Sanitize project data
     */
    public static function sanitize_project_data( $data ) {
        return array(
            'name' => isset( $data['name'] ) ? sanitize_text_field( $data['name'] ) : '',
            'description' => isset( $data['description'] ) ? sanitize_textarea_field( $data['description'] ) : '',
            'status' => isset( $data['status'] ) ? sanitize_text_field( $data['status'] ) : 'planning',
            'link' => isset( $data['link'] ) ? esc_url_raw( $data['link'] ) : '',
            'image_link' => isset( $data['image_link'] ) ? esc_url_raw( $data['image_link'] ) : '',
            'budget' => isset( $data['budget'] ) ? floatval( $data['budget'] ) : 0,
            'tech_stack' => isset( $data['tech_stack'] ) ? sanitize_text_field( $data['tech_stack'] ) : '',
            'deadline' => isset( $data['deadline'] ) ? sanitize_text_field( $data['deadline'] ) : '',
            'tags' => isset( $data['tags'] ) ? sanitize_text_field( $data['tags'] ) : '',
            'client_id' => isset( $data['client_id'] ) ? absint( $data['client_id'] ) : 0,
            'approved' => isset( $data['approved'] ) ? (int) $data['approved'] : 0
        );
    }

    /**
     * Sanitize ticket data
     */
    public static function sanitize_ticket_data( $data ) {
        return array(
            'client_id' => isset( $data['client_id'] ) ? absint( $data['client_id'] ) : 0,
            'project_id' => isset( $data['project_id'] ) ? absint( $data['project_id'] ) : 0,
            'subject' => isset( $data['subject'] ) ? sanitize_text_field( $data['subject'] ) : '',
            'type' => isset( $data['type'] ) ? sanitize_text_field( $data['type'] ) : 'support',
            'status' => isset( $data['status'] ) ? sanitize_text_field( $data['status'] ) : 'open',
            'priority' => isset( $data['priority'] ) ? sanitize_text_field( $data['priority'] ) : 'medium',
            'description' => isset( $data['description'] ) ? sanitize_textarea_field( $data['description'] ) : ''
        );
    }
}

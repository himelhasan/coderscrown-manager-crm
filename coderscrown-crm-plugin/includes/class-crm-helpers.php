<?php
/**
 * Helper utilities for the CRM plugin
 *
 * @package CodersCrown_CRM
 */

class CRM_Helpers {

    /**
     * Get lead status options
     */
    public static function get_lead_statuses() {
        return array(
            'new' => __( 'New', 'coderscrown-crm' ),
            'in_progress' => __( 'In Progress', 'coderscrown-crm' ),
            'contacted' => __( 'Contacted', 'coderscrown-crm' ),
            'waiting_response' => __( 'Waiting Response', 'coderscrown-crm' ),
            'qualified' => __( 'Qualified', 'coderscrown-crm' ),
            'not_interested' => __( 'Not Interested', 'coderscrown-crm' ),
            'converted' => __( 'Converted', 'coderscrown-crm' )
        );
    }

    /**
     * Get project status options
     */
    public static function get_project_statuses() {
        return array(
            'planning' => __( 'Planning', 'coderscrown-crm' ),
            'in_progress' => __( 'In Progress', 'coderscrown-crm' ),
            'on_hold' => __( 'On Hold', 'coderscrown-crm' ),
            'completed' => __( 'Completed', 'coderscrown-crm' ),
            'cancelled' => __( 'Cancelled', 'coderscrown-crm' )
        );
    }

    /**
     * Get ticket status options
     */
    public static function get_ticket_statuses() {
        return array(
            'open' => __( 'Open', 'coderscrown-crm' ),
            'in_progress' => __( 'In Progress', 'coderscrown-crm' ),
            'waiting_client' => __( 'Waiting on Client', 'coderscrown-crm' ),
            'resolved' => __( 'Resolved', 'coderscrown-crm' ),
            'closed' => __( 'Closed', 'coderscrown-crm' )
        );
    }

    /**
     * Get ticket priority options
     */
    public static function get_ticket_priorities() {
        return array(
            'low' => __( 'Low', 'coderscrown-crm' ),
            'medium' => __( 'Medium', 'coderscrown-crm' ),
            'high' => __( 'High', 'coderscrown-crm' ),
            'urgent' => __( 'Urgent', 'coderscrown-crm' )
        );
    }

    /**
     * Format date for display
     */
    public static function format_date( $date ) {
        if ( empty( $date ) || $date === '0000-00-00 00:00:00' ) {
            return '—';
        }
        return date_i18n( get_option( 'date_format' ), strtotime( $date ) );
    }

    /**
     * Format datetime for display
     */
    public static function format_datetime( $datetime ) {
        if ( empty( $datetime ) || $datetime === '0000-00-00 00:00:00' ) {
            return '—';
        }
        return date_i18n( get_option( 'date_format' ) . ' ' . get_option( 'time_format' ), strtotime( $datetime ) );
    }

    /**
     * Get status badge HTML
     */
    public static function get_status_badge( $status, $type = 'lead' ) {
        $class = 'crm-badge crm-badge-' . esc_attr( $status );
        
        if ( $type === 'lead' ) {
            $statuses = self::get_lead_statuses();
        } elseif ( $type === 'project' ) {
            $statuses = self::get_project_statuses();
        } else {
            $statuses = self::get_ticket_statuses();
        }
        
        $label = isset( $statuses[ $status ] ) ? $statuses[ $status ] : $status;
        
        return sprintf( '<span class="%s">%s</span>', $class, esc_html( $label ) );
    }

    /**
     * Get priority badge HTML
     */
    public static function get_priority_badge( $priority ) {
        $priorities = self::get_ticket_priorities();
        $label = isset( $priorities[ $priority ] ) ? $priorities[ $priority ] : $priority;
        $class = 'crm-badge crm-priority-' . esc_attr( $priority );
        
        return sprintf( '<span class="%s">%s</span>', $class, esc_html( $label ) );
    }

    /**
     * Generate API key
     */
    public static function generate_api_key() {
        return 'sk_' . bin2hex( random_bytes( 32 ) );
    }
}

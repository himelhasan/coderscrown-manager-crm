<?php
/**
 * Database schema creation and management
 *
 * @package CodersCrown_CRM
 */

class CRM_Database {

    /**
     * Create all custom database tables
     */
    public static function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );
        
        // Leads table
        $table_leads = $wpdb->prefix . 'crm_leads';
        $sql_leads = "CREATE TABLE $table_leads (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            email varchar(255) NOT NULL,
            phone varchar(50) DEFAULT NULL,
            address text DEFAULT NULL,
            website varchar(255) DEFAULT NULL,
            facebook_link varchar(255) DEFAULT NULL,
            fb_personal_link varchar(255) DEFAULT NULL,
            fb_page_link varchar(255) DEFAULT NULL,
            instagram_link varchar(255) DEFAULT NULL,
            linkedin_link varchar(255) DEFAULT NULL,
            linkedin_company varchar(255) DEFAULT NULL,
            company_name varchar(255) DEFAULT NULL,
            industry varchar(100) DEFAULT NULL,
            company_size varchar(50) DEFAULT NULL,
            position varchar(100) DEFAULT NULL,
            best_contact_time varchar(100) DEFAULT NULL,
            source varchar(100) DEFAULT NULL,
            status varchar(50) DEFAULT 'new',
            tags text DEFAULT NULL,
            notes text DEFAULT NULL,
            cold_outreach_first_email_sent_date datetime DEFAULT NULL,
            cold_outreach_last_outreach_date datetime DEFAULT NULL,
            cold_outreach_next_followup_date datetime DEFAULT NULL,
            cold_outreach_followup_interval varchar(50) DEFAULT NULL,
            cold_outreach_followup_sequence_number int DEFAULT 0,
            cold_outreach_campaign_name varchar(255) DEFAULT NULL,
            cold_outreach_campaign_status varchar(50) DEFAULT NULL,
            cold_outreach_response_status varchar(50) DEFAULT NULL,
            cold_outreach_last_followup_sent_date datetime DEFAULT NULL,
            cold_outreach_automated_followups_scheduled int DEFAULT 0,
            createdAt datetime DEFAULT CURRENT_TIMESTAMP,
            updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY email (email),
            KEY status (status),
            KEY company_name (company_name)
        ) $charset_collate;";
        dbDelta( $sql_leads );
        
        // Projects table
        $table_projects = $wpdb->prefix . 'crm_projects';
        $sql_projects = "CREATE TABLE $table_projects (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            description text DEFAULT NULL,
            status varchar(50) DEFAULT 'planning',
            link varchar(255) DEFAULT NULL,
            image_link varchar(255) DEFAULT NULL,
            budget decimal(10,2) DEFAULT NULL,
            tech_stack text DEFAULT NULL,
            deadline datetime DEFAULT NULL,
            tags text DEFAULT NULL,
            client_id bigint(20) DEFAULT NULL,
            approved tinyint(1) DEFAULT 0,
            createdAt datetime DEFAULT CURRENT_TIMESTAMP,
            updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY client_id (client_id),
            KEY status (status)
        ) $charset_collate;";
        dbDelta( $sql_projects );
        
        // Tickets table
        $table_tickets = $wpdb->prefix . 'crm_tickets';
        $sql_tickets = "CREATE TABLE $table_tickets (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            client_id bigint(20) NOT NULL,
            project_id bigint(20) DEFAULT NULL,
            subject varchar(255) NOT NULL,
            type varchar(50) DEFAULT 'support',
            status varchar(50) DEFAULT 'open',
            priority varchar(50) DEFAULT 'medium',
            description text NOT NULL,
            createdAt datetime DEFAULT CURRENT_TIMESTAMP,
            updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY client_id (client_id),
            KEY project_id (project_id),
            KEY status (status),
            KEY priority (priority)
        ) $charset_collate;";
        dbDelta( $sql_tickets );
        
        // Ticket messages table
        $table_ticket_messages = $wpdb->prefix . 'crm_ticket_messages';
        $sql_ticket_messages = "CREATE TABLE $table_ticket_messages (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            ticket_id bigint(20) NOT NULL,
            sender_id bigint(20) NOT NULL,
            content text NOT NULL,
            createdAt datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY ticket_id (ticket_id)
        ) $charset_collate;";
        dbDelta( $sql_ticket_messages );
        
        // API Keys table
        $table_api_keys = $wpdb->prefix . 'crm_api_keys';
        $sql_api_keys = "CREATE TABLE $table_api_keys (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            api_key varchar(255) NOT NULL,
            permissions text DEFAULT NULL,
            last_used datetime DEFAULT NULL,
            is_active tinyint(1) DEFAULT 1,
            createdAt datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            UNIQUE KEY api_key (api_key)
        ) $charset_collate;";
        dbDelta( $sql_api_keys );
        
        // Campaigns table
        $table_campaigns = $wpdb->prefix . 'crm_campaigns';
        $sql_campaigns = "CREATE TABLE $table_campaigns (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            name varchar(255) NOT NULL,
            description text DEFAULT NULL,
            status varchar(50) DEFAULT 'draft',
            email_template text DEFAULT NULL,
            target_audience text DEFAULT NULL,
            createdAt datetime DEFAULT CURRENT_TIMESTAMP,
            updatedAt datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id)
        ) $charset_collate;";
        dbDelta( $sql_campaigns );
        
        // Outreach logs table
        $table_outreach_logs = $wpdb->prefix . 'crm_outreach_logs';
        $sql_outreach_logs = "CREATE TABLE $table_outreach_logs (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            lead_id bigint(20) NOT NULL,
            campaign_id bigint(20) DEFAULT NULL,
            email_subject varchar(255) DEFAULT NULL,
            email_body text DEFAULT NULL,
            status varchar(50) DEFAULT 'sent',
            outreach_type varchar(50) DEFAULT 'first_email',
            sent_date datetime DEFAULT CURRENT_TIMESTAMP,
            response_date datetime DEFAULT NULL,
            response_status varchar(50) DEFAULT NULL,
            PRIMARY KEY  (id),
            KEY lead_id (lead_id),
            KEY campaign_id (campaign_id)
        ) $charset_collate;";
        dbDelta( $sql_outreach_logs );
        
        // Update database version
        update_option( 'coderscrown_crm_db_version', CODERSCROWN_CRM_VERSION );
    }
    
    /**
     * Drop all custom tables (used on uninstall if user chooses to remove data)
     */
    public static function drop_tables() {
        global $wpdb;
        
        $tables = array(
            $wpdb->prefix . 'crm_leads',
            $wpdb->prefix . 'crm_projects',
            $wpdb->prefix . 'crm_tickets',
            $wpdb->prefix . 'crm_ticket_messages',
            $wpdb->prefix . 'crm_api_keys',
            $wpdb->prefix . 'crm_campaigns',
            $wpdb->prefix . 'crm_outreach_logs'
        );
        
        foreach ( $tables as $table ) {
            $wpdb->query( "DROP TABLE IF EXISTS $table" );
        }
        
        delete_option( 'coderscrown_crm_db_version' );
    }
}

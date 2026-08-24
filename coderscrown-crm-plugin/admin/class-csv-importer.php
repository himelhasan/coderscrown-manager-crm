<?php
/**
 * CSV Importer for Leads
 *
 * @package CodersCrown_CRM
 */

class CRM_CSV_Importer {

    /**
     * Import leads from CSV file
     */
    public static function import_leads() {
        if ( ! isset( $_FILES['csv_file'] ) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK ) {
            echo '<div class="notice notice-error"><p>' . __( 'Please upload a valid CSV file.', 'coderscrown-crm' ) . '</p></div>';
            return;
        }
        
        $file = $_FILES['csv_file']['tmp_name'];
        $handle = fopen( $file, 'r' );
        
        if ( ! $handle ) {
            echo '<div class="notice notice-error"><p>' . __( 'Failed to open CSV file.', 'coderscrown-crm' ) . '</p></div>';
            return;
        }
        
        global $wpdb;
        $table = $wpdb->prefix . 'crm_leads';
        
        // Read header row
        $headers = fgetcsv( $handle );
        $imported = 0;
        $skipped = 0;
        
        // Process each row
        while ( ( $row = fgetcsv( $handle ) ) !== false ) {
            if ( count( $row ) !== count( $headers ) ) {
                $skipped++;
                continue;
            }
            
            $data = array_combine( $headers, $row );
            
            // Check if email already exists
            if ( isset( $data['email'] ) ) {
                $existing = $wpdb->get_var( $wpdb->prepare(
                    "SELECT id FROM $table WHERE email = %s",
                    $data['email']
                ) );
                
                if ( $existing ) {
                    $skipped++;
                    continue;
                }
            }
            
            // Sanitize and insert
            $sanitized = CRM_Security::sanitize_lead_data( $data );
            $result = $wpdb->insert( $table, $sanitized );
            
            if ( $result ) {
                $imported++;
            } else {
                $skipped++;
            }
        }
        
        fclose( $handle );
        
        echo '<div class="notice notice-success"><p>' . sprintf(
            __( 'Import complete! %d leads imported, %d skipped.', 'coderscrown-crm' ),
            $imported,
            $skipped
        ) . '</p></div>';
    }
}

<div class="wrap crm-import">
    <h1><?php _e( 'Import Leads from CSV', 'coderscrown-crm' ); ?></h1>
    
    <div class="card">
        <h2><?php _e( 'CSV Format Requirements', 'coderscrown-crm' ); ?></h2>
        <p><?php _e( 'Your CSV file should have the following columns (header row required):', 'coderscrown-crm' ); ?></p>
        <ul>
            <li><strong>name</strong> - Lead name (required)</li>
            <li><strong>email</strong> - Email address (required)</li>
            <li><strong>phone</strong> - Phone number</li>
            <li><strong>company_name</strong> - Company name</li>
            <li><strong>position</strong> - Job position</li>
            <li><strong>website</strong> - Website URL</li>
            <li><strong>industry</strong> - Industry</li>
            <li><strong>source</strong> - Lead source</li>
            <li><strong>status</strong> - Status (new, in_progress, contacted, etc.)</li>
            <li><strong>tags</strong> - Comma-separated tags</li>
        </ul>
        <p class="description"><?php _e( 'Leads with duplicate email addresses will be skipped.', 'coderscrown-crm' ); ?></p>
    </div>
    
    <form method="post" enctype="multipart/form-data">
        <?php wp_nonce_field( 'crm_import_csv' ); ?>
        <input type="hidden" name="crm_action" value="import_csv">
        
        <table class="form-table">
            <tr>
                <th><label for="csv_file"><?php _e( 'CSV File', 'coderscrown-crm' ); ?></label></th>
                <td>
                    <input type="file" name="csv_file" id="csv_file" accept=".csv" required>
                    <p class="description"><?php _e( 'Select a CSV file to import.', 'coderscrown-crm' ); ?></p>
                </td>
            </tr>
        </table>
        
        <p class="submit">
            <button type="submit" name="crm_import_csv" class="button button-primary"><?php _e( 'Import Leads', 'coderscrown-crm' ); ?></button>
            <a href="<?php echo admin_url( 'admin.php?page=crm-leads' ); ?>" class="button"><?php _e( 'Cancel', 'coderscrown-crm' ); ?></a>
        </p>
    </form>
</div>

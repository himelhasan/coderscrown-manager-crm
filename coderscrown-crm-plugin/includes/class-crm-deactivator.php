<?php
/**
 * Fired during plugin deactivation
 *
 * @package CodersCrown_CRM
 */

class CRM_Deactivator {

    /**
     * Plugin deactivation logic
     */
    public static function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
        
        // Note: We don't remove data on deactivation
        // Data removal only happens on uninstall if user chooses
    }
}

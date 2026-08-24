<?php
/**
 * Projects Administration
 *
 * @package CodersCrown_CRM
 */

class CRM_Projects_Admin {

    /**
     * Render projects page
     */
    public static function render_projects_page() {
        echo '<div id="coderscrown-crm-root"></div>';
    }

    /**
     * Render projects list
     */
    /**
     * Render projects list
     */
    private static function render_projects_list() {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_projects';
        
        $status_filter = isset( $_GET['status'] ) ? sanitize_text_field( $_GET['status'] ) : '';
        
        $where = '1=1';
        $params = array();
        
        // Filter by Client if user is a client
        if ( current_user_can( 'client' ) && ! current_user_can( 'administrator' ) ) {
            $where .= ' AND client_id = %d';
            $params[] = get_current_user_id();
        }
        
        if ( $status_filter ) {
            $where .= ' AND status = %s';
            $params[] = $status_filter;
        }
        
        $sql = "SELECT * FROM $table WHERE $where ORDER BY updatedAt DESC";
        
        if ( ! empty( $params ) ) {
            $sql = $wpdb->prepare( $sql, $params );
        }
        
        $projects = $wpdb->get_results( $sql );
        $total_count = $wpdb->get_var( "SELECT COUNT(*) FROM $table" );
        
        include CODERSCROWN_CRM_PLUGIN_DIR . 'admin/views/projects-list.php';
    }

    /**
     * Approve project
     */
    private static function approve_project() {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_projects';
        
        $project_id = isset( $_POST['project_id'] ) ? absint( $_POST['project_id'] ) : 0;
        
        if ( $project_id ) {
            $result = $wpdb->update( 
                $table, 
                array( 'approved' => 1 ), 
                array( 'id' => $project_id ),
                array( '%d' ),
                array( '%d' )
            );
            
            if ( $result !== false ) {
                wp_redirect( add_query_arg( array( 'page' => 'crm-projects', 'message' => 'approved' ), admin_url( 'admin.php' ) ) );
                exit;
            }
        }
    }

    /**
     * Save project
     */
    private static function save_project() {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_projects';
        
        $project_id = isset( $_POST['project_id'] ) ? absint( $_POST['project_id'] ) : 0;
        $data = CRM_Security::sanitize_project_data( $_POST );
        
        if ( $project_id ) {
            $result = $wpdb->update( $table, $data, array( 'id' => $project_id ) );
            if ( $result !== false ) {
                wp_redirect( add_query_arg( array( 'page' => 'crm-projects', 'message' => 'updated' ), admin_url( 'admin.php' ) ) );
                exit;
            }
        } else {
            $result = $wpdb->insert( $table, $data );
            if ( $result ) {
                wp_redirect( add_query_arg( array( 'page' => 'crm-projects', 'message' => 'created' ), admin_url( 'admin.php' ) ) );
                exit;
            }
        }
    }

    /**
     * Delete project
     */
    private static function delete_project() {
        global $wpdb;
        $table = $wpdb->prefix . 'crm_projects';
        
        $project_id = isset( $_POST['project_id'] ) ? absint( $_POST['project_id'] ) : 0;
        
        if ( $project_id ) {
            $result = $wpdb->delete( $table, array( 'id' => $project_id ) );
            if ( $result ) {
                wp_redirect( add_query_arg( array( 'page' => 'crm-projects', 'message' => 'deleted' ), admin_url( 'admin.php' ) ) );
                exit;
            }
        }
    }
    
    /**
     * Handle form submissions
     */
    public static function handle_submissions() {
        $action = isset( $_POST['crm_action'] ) ? sanitize_text_field( $_POST['crm_action'] ) : '';
        
        if ( 'save_project' === $action && check_admin_referer( 'crm_save_project' ) ) {
            self::save_project();
        }
        
        if ( 'delete_project' === $action && check_admin_referer( 'crm_save_project' ) ) {
            self::delete_project();
        }

        if ( 'approve_project' === $action && check_admin_referer( 'crm_approve_project' ) ) {
            self::approve_project();
        }
    }
    
    public static function display_notices() {
        if ( isset( $_GET['message'] ) ) {
            $message = sanitize_text_field( $_GET['message'] );
            $notices = array(
                'created' => __( 'Project created successfully.', 'coderscrown-crm' ),
                'updated' => __( 'Project updated successfully.', 'coderscrown-crm' ),
                'deleted' => __( 'Project deleted successfully.', 'coderscrown-crm' ),
                'approved' => __( 'Project approved successfully.', 'coderscrown-crm' )
            );
            
            if ( isset( $notices[ $message ] ) ) {
                echo '<div class="notice notice-success is-dismissible"><p>' . esc_html( $notices[ $message ] ) . '</p></div>';
            }
        }
    }
}

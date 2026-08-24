<div class="wrap crm-api-keys">
    <h1><?php _e( 'API Keys for N8N Integration', 'coderscrown-crm' ); ?></h1>
    
    <div class="card">
        <h2><?php _e( 'Generate New API Key', 'coderscrown-crm' ); ?></h2>
        <form method="post">
            <?php wp_nonce_field( 'crm_generate_key' ); ?>
            <input type="hidden" name="crm_action" value="generate_api_key">
            <table class="form-table">
                <tr>
                    <th><label for="key_name"><?php _e( 'Key Name', 'coderscrown-crm' ); ?></label></th>
                    <td>
                        <input type="text" name="key_name" id="key_name" class="regular-text" placeholder="<?php _e( 'e.g., N8N Production', 'coderscrown-crm' ); ?>" required>
                        <p class="description"><?php _e( 'A descriptive name to identify this API key.', 'coderscrown-crm' ); ?></p>
                    </td>
                </tr>
            </table>
            <p class="submit">
                <button type="submit" name="crm_generate_key" class="button button-primary"><?php _e( 'Generate API Key', 'coderscrown-crm' ); ?></button>
            </p>
        </form>
    </div>
    
    <h2><?php _e( 'Existing API Keys', 'coderscrown-crm' ); ?></h2>
    <table class="wp-list-table widefat fixed striped">
        <thead>
            <tr>
                <th><?php _e( 'Name', 'coderscrown-crm' ); ?></th>
                <th><?php _e( 'Key', 'coderscrown-crm' ); ?></th>
                <th><?php _e( 'Status', 'coderscrown-crm' ); ?></th>
                <th><?php _e( 'Last Used', 'coderscrown-crm' ); ?></th>
                <th><?php _e( 'Created', 'coderscrown-crm' ); ?></th>
                <th><?php _e( 'Actions', 'coderscrown-crm' ); ?></th>
            </tr>
        </thead>
        <tbody>
            <?php if ( ! empty( $api_keys ) ) : ?>
                <?php foreach ( $api_keys as $key ) : ?>
                    <tr>
                        <td><strong><?php echo esc_html( $key->name ); ?></strong></td>
                        <td><code><?php echo esc_html( substr( $key->api_key, 0, 20 ) . '...' ); ?></code></td>
                        <td>
                            <?php if ( $key->is_active ) : ?>
                                <span class="crm-badge crm-badge-active"><?php _e( 'Active', 'coderscrown-crm' ); ?></span>
                            <?php else : ?>
                                <span class="crm-badge crm-badge-inactive"><?php _e( 'Revoked', 'coderscrown-crm' ); ?></span>
                            <?php endif; ?>
                        </td>
                        <td><?php echo CRM_Helpers::format_datetime( $key->last_used ); ?></td>
                        <td><?php echo CRM_Helpers::format_datetime( $key->createdAt ); ?></td>
                        <td>
                            <?php if ( $key->is_active ) : ?>
                                <form method="post" style="display: inline;">
                                    <?php wp_nonce_field( 'crm_revoke_key' ); ?>
                                    <input type="hidden" name="crm_action" value="revoke_api_key">
                                    <input type="hidden" name="key_id" value="<?php echo esc_attr( $key->id ); ?>">
                                    <button type="submit" name="crm_revoke_key" class="button button-small" onclick="return confirm('<?php _e( 'Are you sure you want to revoke this API key?', 'coderscrown-crm' ); ?>');"><?php _e( 'Revoke', 'coderscrown-crm' ); ?></button>
                                </form>
                            <?php endif; ?>
                        </td>
                    </tr>
                <?php endforeach; ?>
            <?php else : ?>
                <tr>
                    <td colspan="6"><?php _e( 'No API keys yet.', 'coderscrown-crm' ); ?></td>
                </tr>
            <?php endif; ?>
        </tbody>
    </table>
    
    <div class="card" style="margin-top: 20px;">
        <h2><?php _e( 'API Documentation', 'coderscrown-crm' ); ?></h2>
        <p><?php _e( 'Use these endpoints in your N8N workflows:', 'coderscrown-crm' ); ?></p>
        <h3><?php _e( 'Authentication', 'coderscrown-crm' ); ?></h3>
        <p><?php _e( 'Include the API key in the Authorization header:', 'coderscrown-crm' ); ?></p>
        <pre><code>Authorization: Bearer sk_your_api_key_here</code></pre>
        
        <h3><?php _e( 'Endpoints', 'coderscrown-crm' ); ?></h3>
        <ul>
            <li><strong>GET</strong> <code><?php echo rest_url( 'crm/v1/leads' ); ?></code> - Get all leads (filter by ?status=new)</li>
            <li><strong>GET</strong> <code><?php echo rest_url( 'crm/v1/leads/{id}' ); ?></code> - Get single lead</li>
            <li><strong>POST</strong> <code><?php echo rest_url( 'crm/v1/leads' ); ?></code> - Create new lead</li>
            <li><strong>POST</strong> <code><?php echo rest_url( 'crm/v1/leads/{id}/outreach-history' ); ?></code> - Log email sent (unlocks cold outreach fields)</li>
            <li><strong>POST</strong> <code><?php echo rest_url( 'crm/v1/leads/{id}/schedule-followup' ); ?></code> - Schedule follow-up</li>
        </ul>
    </div>
</div>

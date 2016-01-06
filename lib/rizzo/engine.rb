module Rizzo
  class Engine < Rails::Engine

    initializer "rizzo.configure_rails_initialization" do |app|

      app.routes.prepend do
        get 'breadcrumb'        => 'global_resources#breadcrumb'
        get "r/:encrypted_url"  => 'redirector#show', :as => :redirector
        get "redirector"        => 'redirector#internal', :as => :internal_redirector
        post 'rizzo_sailthru'   => 'rizzo/sailthru#save', :as => :rizzo_sailthru
      end

    end

    initializer "rizzo.update_asset_paths" do |app|
      app.config.assets.precompile += Rizzo::Assets.precompile_as_engine
    end
  end
end

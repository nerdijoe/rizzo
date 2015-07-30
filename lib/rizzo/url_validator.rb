require 'addressable/uri'

module Rizzo
  module UrlValidator
    class InvalidUrl < StandardError; end

    def self.validate(url = "")
      target = Addressable::URI.heuristic_parse(url)
      target.path = "/#{target.path}" unless target.path[0] == '/'
      target.host = whitelisted_hosts(target.host) || ENV['APP_HOST'] || 'www.lonelyplanet.com'
      target.scheme = ENV['APP_SCHEME'] || ((target.scheme == 'http' || target.scheme == 'https') ? target.scheme : 'http')
      target.port = target.scheme == 'https' ? 443 : 80
      target.to_s
    rescue => e
      Airbrake.notify(e) if defined?(Airbrake)
      raise InvalidUrl
    end

    private

    def self.whitelisted_hosts(url)
      hosts = YAML.load_file(Rails.root.join('app/data/lib/url_validator.yml'))[:hosts]
      hosts.include?(url) ? url : nil
    end
  end
end

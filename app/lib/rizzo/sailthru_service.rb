module Rizzo
  class SailthruService
    SAILTHRU_API_URL = ENV['RIZZO_SAILTHRU_API_URL'] || 'http://canary.community.lonelyplanet.com/'
    REGISTER_OR_CHECK_URL = SAILTHRU_API_URL + "sailthru/v1/users"
    SEND_EMAIL_URL = SAILTHRU_API_URL + "sailthru/v1/email"
    SAILTHRU_REGIONS = YAML.load_file(Rizzo::Engine.root.join('app/data/sailthru/regions.yml'))

    def self.register(params)
      return 409 if exists?(params[:email])

      status = create_or_update!(params)

      if params[:email_template] && status == 200
        send!(params[:email], params[:email_template])
      end

      status
    end

    def self.exists?(email)
      response = Typhoeus::Request.new(REGISTER_OR_CHECK_URL,
        params: { email: email }
      ).run
      response.code == 200
    end

    def self.create_or_update!(params)
      return 400 if invalid?(params)

      response = Typhoeus::Request.new(REGISTER_OR_CHECK_URL,
        method: :put,
        headers: { "Content-Type" => 'application/json' },
        body: {
          email: params[:email],
          country: params[:country],
          region: SAILTHRU_REGIONS[params[:country]],
          lists: [params[:lists]],
          source: params[:source],
          vars: params[:vars]
        }.to_json
      ).run
      response.code
    end

    def self.send!(email, template)
      Typhoeus::Request.new(SEND_EMAIL_URL,
        method: :post,
        params: {
          email: email,
          template: template
        }
      ).run
    end

    private

    def self.invalid?(params)
      params.values.any? { |param| param.blank? }
    end
  end
end

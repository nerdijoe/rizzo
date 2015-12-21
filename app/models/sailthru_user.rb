class SailthruUser
  REGISTER_OR_CHECK_URL = "http://canary.community.lonelyplanet.com/sailthru/v1/users"
  SAILTHRU_REGIONS = YAML.load(File.read(File.expand_path('../../data/sailthru/regions.yml', __FILE__)))

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

  private

  def self.invalid?(params)
    params.values.any? { |param| param.blank? }
  end
end

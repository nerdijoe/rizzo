class SailthruEmail
  SEND_EMAIL_URL = "http://canary.community.lonelyplanet.com/sailthru/v1/email"

  def self.send!(email, template)
    Typhoeus::Request.new(SEND_EMAIL_URL,
      method: :post,
      params: {
        email: email,
        template: template
      }
    ).run
  end
end

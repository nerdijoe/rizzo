class Rizzo::SailthruController < ActionController::Base
  include SailthruHelper

  def save
    render json: {}, status: register(form_params)
  end

  def form_params
    params.require(:sailthru)
  end

end

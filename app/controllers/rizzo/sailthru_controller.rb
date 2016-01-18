module Rizzo
  class SailthruController < ActionController::Base

    def save
      render json: {}, status: SailthruService.register(form_params)
    end

    private

    def form_params
      params.require(:sailthru)
    end
  end
end

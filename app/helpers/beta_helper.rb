# BETA
module BetaHelper
  # Look for a place presenter from Waldorf
  def place?
    return false unless place_presenter_defined?
    return false unless respond_to? :presenter
    presenter.is_a?(PlacePresenter)
  end
  alias_method :is_place?, :place?

  # Show banner when ?beta=destinations-next is in the URL
  def show_beta_banner
    return 1.0 if params[:beta] == 'destinations-next'

    # prng = Random.new(Time.now.to_i)
    # prng.rand < 0.01
    false
  end

  private

  def place_presenter_defined?
    defined? PlacePresenter
  end
end

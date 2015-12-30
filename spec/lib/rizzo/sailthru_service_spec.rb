require 'spec_helper'

describe Rizzo::SailthruService do

  let(:ok) { 200 }
  let(:already_exists) { 409 }
  let(:invalid) { 400 }
  let(:response_ok) { Typhoeus::Response.new(code: ok, body: '') }
  let(:response_not_exists) { Typhoeus::Response.new(code: 404, body: '') }
  let(:email) { 'sth@example.com' }
  let(:correct_data) do
    {
      email: email,
      country: 'Poland',
      source: 'homepage_footer'
    }
  end
  let(:email_request_body) do
    {
      method: :post,
      params: {email: email, template: "Welcome email"}
    }    
  end

  describe 'register' do

    before(:each) do
      Typhoeus::Request.stub_chain(:new, :run)
        .and_return(response_not_exists, response_ok, response_ok)
    end

    context 'all data correct' do
      it 'returns ok status' do
        Rizzo::SailthruService.register(correct_data).should eq ok
      end

      context 'email template specified' do
        it 'sends welcome email' do
          Typhoeus::Request.should_receive(:new).with(anything, email_request_body).once
          correct_data[:email_template] = "Welcome email"
          Rizzo::SailthruService.register(correct_data)
        end
      end
    end

    context 'some data empty' do
      it 'returns invalid status' do
        correct_data[:email] = ""
        Rizzo::SailthruService.register(correct_data).should eq invalid
      end
    end

    context 'already exists' do
      it 'returns already exists status' do
        Typhoeus::Request.stub_chain(:new, :run).and_return(response_ok)
        Rizzo::SailthruService.register(correct_data).should eq already_exists
      end
    end
  end
end

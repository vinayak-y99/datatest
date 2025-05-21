"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = 'http://127.0.0.1:8000/api/hiredb';

const SubscriptionManagement = () => {
  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [usageStats, setUsageStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribing, setSubscribing] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  axios.defaults.withCredentials = true;

  const subscriptionPlans = [
    {
      name: 'Basic',
      price: 'Free',
      priceValue: 0.0,
      features: ['5GB Storage', 'Basic Support', 'Core Features'],
      api_calls_limit: 1000,
      description: 'Perfect for getting started'
    },
    {
      name: 'Premium', 
      price: '$29/month',
      priceValue: 29.0,
      features: ['50GB Storage', 'Priority Support', 'Advanced Features'],
      api_calls_limit: 10000,
      description: 'Best for growing businesses'
    },
    {
      name: 'Enterprise',
      price: '$99/month', 
      priceValue: 99.0,
      features: ['Unlimited Storage', '24/7 Support', 'Custom Features'],
      api_calls_limit: 100000,
      description: 'For large scale operations'
    }
  ];

  const fetchUserSubscriptions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/subscriptions/${userId}`);
      console.log('Subscription data:', response.data);
      setUserSubscriptions(response.data);
      setError(null);
    } catch (error) {
      console.log('Fetch error:', error);
      setError('Failed to fetch subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planName) => {
    setSubscribing(true);
    const selectedPlan = subscriptionPlans.find(plan => plan.name === planName);

    const subscriptionData = {
      user_id: userId,
      plan_name: planName,
      price: selectedPlan.priceValue,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      credentials: {
        api_calls_limit: selectedPlan.api_calls_limit,
        features: selectedPlan.features,
        active: true,
        api_key: crypto.randomUUID()
      }
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/subscriptions`, subscriptionData);
      if (response.data) {
        await fetchUserSubscriptions();
      }
    } catch (error) {
      console.log('Subscription error:', error.response?.data);
    } finally {
      setSubscribing(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId) => {
    try {
      await axios.delete(`${API_BASE_URL}/subscriptions/${subscriptionId}`);
      await fetchUserSubscriptions();
    } catch (error) {
      console.error('Cancellation error:', error);
    }
  };

  const handleRegenerateApiKey = async (subscriptionId) => {
    try {
      await axios.post(`${API_BASE_URL}/subscriptions/${subscriptionId}/regenerate-key`);
      await fetchUserSubscriptions();
    } catch (error) {
      console.error('API key regeneration error:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserSubscriptions();
    }
  }, [userId]);

  const calculateUsagePercentage = (subscription) => {
    const usage = usageStats[subscription.subscription_id]?.api_calls || 0;
    const limit = subscription.api_calls_limit || 1;
    return Math.min((usage / limit) * 100, 100);
  };

  return (
    <div className="max-w-full mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Subscription Management</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Available Plans</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {subscriptionPlans.map((plan) => (
            <div key={plan.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-blue-500 transition-all">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-3xl font-bold mb-2">{plan.price}</p>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              <ul className="mb-6 space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.name)}
                disabled={subscribing}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-200 disabled:opacity-50"
              >
                {subscribing ? 'Processing...' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Active Subscriptions</h2>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : userSubscriptions.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No active subscriptions. Choose a plan above to get started.</p>
          </div>
        ) : (
          userSubscriptions.map(subscription => (
            <div key={subscription.subscription_id} className="bg-white rounded-xl p-6 shadow-sm mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{subscription.plan_name}</h3>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    subscription.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {subscription.status}
                  </span>
                  <button
                    onClick={() => handleCancelSubscription(subscription.subscription_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">API Key</span>
                  <button
                    onClick={() => handleRegenerateApiKey(subscription.subscription_id)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Regenerate Key
                  </button>
                </div>
                <code className="block w-full p-2 bg-gray-100 rounded text-sm">
                  {subscription.api_key || 'No API key available'}
                </code>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>API Usage</span>
                  <span>{usageStats[subscription.subscription_id]?.api_calls || 0} / {subscription.api_calls_limit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateUsagePercentage(subscription)}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default SubscriptionManagement;

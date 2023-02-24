<template>
  <div>
    <div v-if="paymentCompleted">
      Thank You For Your Donation
    </div>
    <p class="text-red my-3" v-if="error_message">
      Error: {{ error_message }}
    </p>
    <h1 v-if="!loading && !paymentCompleted" class="mt-4">You will be redirected to GoCardless, our Direct Debit provider. Once you have completed the setup, you will be redirected back to our website.</h1>
    <div v-if="loading" class="bg-green flex items-center justify-center flex-col">
      <h1 class="text-white font-bold p-6">
        Waiting for Payment Process ....  
      </h1>
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto;display: block; shape-rendering: auto;" width="60px" height="60px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <circle cx="50" cy="50" fill="none" stroke="#FFFFFF" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">
          <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1">
          </animateTransform>
        </circle>
      </svg>
      <br>
    </div>
    <div class="my-6 flex justify-between" v-if="!loading && !paymentCompleted">
      <button type="button" @click="moveBack()" class="px-6 pt-2.5 pb-2 bg-gray-600 text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green hover:shadow-lg focus:bg-green focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 mr-3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Back
      </button>
      <button 
        :disabled="loading"
        @click="saveDonation()"
        type="button" class="px-6 pt-2.5 pb-2 bg-red text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green hover:shadow-lg focus:bg-green focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
        Setup Direct Debit
        <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 ml-3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto;display: block; shape-rendering: auto;" width="20px" height="20px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
          <circle cx="50" cy="50" fill="none" stroke="#FFFFFF" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">
            <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1">
            </animateTransform>
          </circle>
        </svg>
      </button>
    </div>
  </div>
</template>
<script>
import Api from "../services/api";
import Pusher from 'pusher-js';
export default {
  props: ["amount","form","donations"],
  data() {
    return {
      loading: false,
      paymentCompleted: false,
      url: import.meta.env.VITE_WEB_URL,
      auth_url: import.meta.env.VITE_APP_URL,
      error_message:''
    };
  },

  mounted() {
    
  },

  methods: {
    moveBack() {
      this.$emit('moveBack')
    },
    async generateGocardlessHostedUrl(payload) {
      const { data } = await Api.gocardlessHostedUrl({ donation_id: payload })
      window.open(data.redirect_url,'_blank');
    },
    async saveDonation(token) {
      this.loading = true
      this.form.donations = this.donations
      let { data } = await Api.saveDonation(this.form);
      if (data.success == 0) {
        this.loading = false
        this.error_message = data.message
        console.log(data.message)
        return;
      }

      this.error_message = ""
      if (data?.monthly_donation) {
        this.pusherGocardlessLister(data.monthly_donation.id)
        this.generateGocardlessHostedUrl(data.monthly_donation.id)
      } else {
        console.error('something went Wrong')
      }
    },
    pusherGocardlessLister(donation_id) {
      var pusher = new Pusher('23ccf009fe890a7ca4ae', {
        cluster: 'eu',
        // authEndpoint: this.auth_url + '/broadcasting/auth'
      });
      let instance = this
      var channel = pusher.subscribe(`gocardless-response.${donation_id}`);
      channel.bind('gocardless-event', function(data) {
        instance.loading = false;
        instance.paymentCompleted = true

        instance.$emit('completed',data)
      });
    }
  },
};
</script>

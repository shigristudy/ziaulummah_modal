<template>
  <div v-show="!waiting_for_redirect">
    <div :class="{
      'flex' : loading,
      'hidden':!loading
    }" class="bg-green  items-center justify-center flex-col">
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
    <form v-show="!loading">
      <div class="block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none">
        <!-- <div id="card-element"></div> -->
        <div id="payment-element"></div>
      </div>
      <div class="my-6 flex justify-between">
        <button type="button" @click="moveBack()" class="px-6 pt-2.5 pb-2 bg-gray-600 text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green hover:shadow-lg focus:bg-green focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 mr-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Back
        </button>
        <button 
          id="stripeSubmit"
          :disabled="loading"
          type="button" class="px-6 pt-2.5 pb-2 bg-red text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green hover:shadow-lg focus:bg-green focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
          Donate
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
      <div>
        <p class="text-green font-bold border-b-2 border-green" v-if="stripeSuccess">
          {{ stripeSuccess }}
        </p>
      </div>
      <div>
        <p class="text-red font-bold border-b-2 border-red" v-if="stripeError">
          * {{ stripeError }}
        </p>
      </div>
      
    </form>
  </div>
  <div v-show="waiting_for_redirect">
    <div :class="{
      'flex' : waiting_for_redirect,
    }" class="bg-green  items-center justify-center flex-col">
      <h1 class="text-white font-bold p-6">
        Waiting for Redirecting ...  
      </h1>
      <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="margin: auto;display: block; shape-rendering: auto;" width="60px" height="60px" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
        <circle cx="50" cy="50" fill="none" stroke="#FFFFFF" stroke-width="10" r="35" stroke-dasharray="164.93361431346415 56.97787143782138">
          <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s" values="0 50 50;360 50 50" keyTimes="0;1">
          </animateTransform>
        </circle>
      </svg>
    </div>
  </div>
</template>
<script>
import Api from "../services/api";
export default {
  props: ["amount","customer","stripePublicKey"],
  data() {
    return {
      stripe: null,
      stripeError: "",
      stripeSuccess: "",
      error: false,
      loading: false,
      url: import.meta.env.VITE_WEB_URL,
      client_secret: '',
      card: null,
      payment_intent: null,
      waiting_for_redirect:false
    };
  },

  mounted() {
    this.createStripeIntent()
  },

  methods: {
    async createStripeIntent() {
      const { data } = await Api.createStripeIntentRequest({
        amount: this.amount,
        currency: this.customer.selected_currency,
        name: (this.customer.first_name + ' ' + this.customer.last_name).trim(),
        email:this.customer.email
      })

      this.payment_intent = data

      this.client_secret = data.client_secret

      this.setUpStripe();
    },
    moveBack() {
      this.$emit('moveBack')
    },
    setUpStripe() {
      
      const stripe = Stripe(this.stripePublicKey);
      this.stripe = stripe;

      const clientSecret = this.client_secret
      const elements = stripe.elements({clientSecret});
      // console.log(clientSecret)
      const card = elements.create("payment");
      this.card = card
      // card.mount("#card-element");
      card.mount("#payment-element");
      let vm = this
      const btn = document.querySelector('#stripeSubmit')
      .addEventListener('click',async (event) =>{
        vm.loading = true
        event.preventDefault();
          stripe.confirmPayment({
            elements,
            redirect:'if_required'
          }).then(function(result) {
            if (result.error) {
              vm.loading = false
              vm.stripeError = result.error.message

              return
            }
            
            
            if(result.paymentIntent.status == "succeeded"){
              vm.loading = false
              vm.waiting_for_redirect = true
              vm.$emit("stripePayment", vm.payment_intent);
            }
            
          });
      })

      card.addEventListener('change', ({error}) => {
        if (error) {
          this.stripeError = error.message;
          this.error = true
          this.loading = false
        }else {
          this.error = false
          this.loading = false
          this.stripeError = "";
        }
      });
    }
  },
};
</script>

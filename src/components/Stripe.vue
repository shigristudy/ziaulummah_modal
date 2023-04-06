<template>
  <div>
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
        <div id="card-element">
        </div>
      </div>
      <div class="my-6 flex justify-between">
        <button type="button" @click="moveBack()" class="px-6 pt-2.5 pb-2 bg-gray-600 text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green hover:shadow-lg focus:bg-green focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 mr-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Back
        </button>
        <button 
          @click.prevent="handleFormSubmit()"
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
        <p class="text-red" v-if="stripeError">
          {{ stripeError }}
        </p>
      </div>
      <div>
        <p class="text-green" v-if="stripeSuccess">
          {{ stripeSuccess }}
        </p>
      </div>
    </form>
  </div>
</template>
<script>
import Api from "../services/api";
export default {
  props: ["amount","customer","stripePublicKey","donations"],
  data() {
    return {
      card: {
        cvc: "",
        number: "",
        expiry: "",
      },

      //elements
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
      stripe: null,

      // errors
      stripeError: "",
      stripeSuccess: "",
      cardCvcError: "",
      cardExpiryError: "",
      cardNumberError: "",
      error: false,

      loading: false,
      url: import.meta.env.VITE_WEB_URL,
      client_secret: '',
      card: null,
      payment_intent: null,
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

      const elements = stripe.elements();

      var card = elements.create("card");
      this.card = card
      card.mount("#card-element");


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
    },

    handleFormSubmit() {
      this.loading = true
      let vm = this
      this.stripe.confirmCardPayment(this.client_secret, {
        payment_method: {
          card: this.card,
          billing_details: {
            name: this.customer.name,
            email: this.customer.email
          }
        },
        setup_future_usage: 'off_session'
      }).then(function (result) {
        
        if (result.error) {
          vm.stripeError = result.error.message;
          vm.loading = false
        } else {
          if (result.paymentIntent.status === 'succeeded') {
            vm.stripeSuccess = "payment successfully completed."
            vm.handleStripePayment(vm.payment_intent)
            // vm.$emit("stripePayment", vm.payment_intent);
            // vm.loading = false
          }
          return false;
        }
      });
    },

    async handleStripePayment(payment_intent) {
      this.customer.donations = this.donations
      
      let { data } = await Api.saveDonation(this.customer);
      
      if (data.success) {
        let payment = {};
        payment.payment_intent = payment_intent;
        payment.name = this.customer.first_name;
        payment.email = this.customer.email;
        payment.amount = { monthly: 0, single: 0 };
        payment.donor = data.donor;
        payment.currency = data.currency;
        // payment.donation = data.donation;
        payment.monthly_donation = data.monthly_donation;
        payment.one_off_donation = data.one_off_donation;

        this.donations.map((f) => {
          if (f.monthly) {
            if (f.amount) {
              payment.amount.monthly += f.amount;
            } else {
              payment.amount.monthly += f.fix_amount;
            }
          }
          if (!f.monthly) {
            if (f.amount) {
              payment.amount.single += f.amount;
            } else {
              payment.amount.single += f.fix_amount;
            }
          }
        });

        this.subscriptionIntentHandle(payment)
      }
    },


    async subscriptionIntentHandle(payment){
      let { data } = await Api.makePayment(payment);
        if (data.success) {
          // console.log(data.subscription)
          if(
            data.subscription 
            && data.subscription.latest_invoice 
            && data.subscription.latest_invoice.payment_intent
          ){
            console.log(data.subscription.latest_invoice.payment_intent.client_secret)

            this.stripe.confirmCardPayment(data.subscription.latest_invoice.payment_intent.client_secret, {
              payment_method: {
                card: this.card,
                billing_details: {
                  name: this.customer.name,
                  email: this.customer.email
                }
              },
              setup_future_usage: 'off_session'
            }).then(function (result) {
              if (result.paymentIntent.status === 'succeeded') {
                this.loading = false
              }
            })
          }
          // this.initAgain();
          // this.moveForward()
        } else {
          this.errors.authentication = data.message
        }
    },
    listenForErrors() {
      const vm = this;

      this.cardNumber.addEventListener("change", (event) => {
        vm.toggleError(event);
        vm.cardNumberError = "";
        vm.card.number = event.complete ? true : false;
      });

      this.cardExpiry.addEventListener("change", (event) => {
        vm.toggleError(event);
        vm.cardExpiryError = "";
        vm.card.expiry = event.complete ? true : false;
      });

      this.cardCvc.addEventListener("change", (event) => {
        vm.toggleError(event);
        vm.cardCvcError = "";
        vm.card.cvc = event.complete ? true : false;
      });
    },

    toggleError(event) {
      if (event.error) {
        this.stripeError = event.error.message;
        this.error = true
        this.loading = false
      } else {
        this.stripeError = "";
      }
    },

    submitFormToCreateToken() {
      this.clearCardErrors();
      let valid = true;

      if (!this.card.number) {
        valid = false;
        this.cardNumberError = "Card Number is Required";
      }
      if (!this.card.cvc) {
        valid = false;
        this.cardCvcError = "CVC is Required";
      }
      if (!this.card.expiry) {
        valid = false;
        this.cardExpiryError = "Month is Required";
      }
      if (this.stripeError) {
        valid = false;
      }
      if (valid) {
        this.createToken();
      }
    },

    createToken() {
      this.loading = true
      this.stripe.createToken(this.cardNumber,
      {
        name: this.customer.email,
        address_line1: this.customer.address_line_1,
        address_city: this.customer.city,
        address_country: this.customer.country
       }).then(async (result) => {
        if (result.error) {
          this.stripeError = result.error.message;
          this.loading = false
        } else {
          const token = result.token.id;
          this.$emit("stripePayment", token);
        }
      });
    },

    clearElementsInputs() {
      this.cardCvc.clear();
      this.cardExpiry.clear();
      this.cardNumber.clear();
    },

    clearCardErrors() {
      this.stripeError = "";
      this.cardCvcError = "";
      this.cardExpiryError = "";
      this.cardNumberError = "";
    },
  },
};
</script>

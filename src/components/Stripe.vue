<template>
  <div>
    <form>
      <div>
        <p class="stripe__error" v-if="stripeError">
          {{ stripeError }}
        </p>
      </div>

      <div class="stripe">
        <label for="Card Number" class="stripe__label"> Card Number </label>
        <div>
          <div id="card-number" class="block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"></div>
          <span class="stripe__error" v-if="cardNumberError">
            {{ cardNumberError }}
          </span>
        </div>
      </div>

      <div class="stripe__box">
        <div class="stripe__box__cvv">
          <label for="Card CVC" class="stripe__label"> Card CVC </label>
          <div>
            <div id="card-cvc" class="block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"></div>
            <span class="stripe__error" v-if="cardCvcError">
              {{ cardCvcError }}
            </span>
          </div>
        </div>
        <div class="stripe__box__expiry">
          <label for="Expiry Month" class="stripe__label"> Expiry </label>
          <div>
            <div id="card-expiry" class="block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"></div>
            <span class="stripe__error" v-if="cardExpiryError">
              {{ cardExpiryError }}
            </span>
          </div>
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
          @click.prevent="submitFormToCreateToken()"
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
    </form>
  </div>
</template>
<script>
export default {
  props: ["amount","customer","stripePublicKey"],
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
      cardCvcError: "",
      cardExpiryError: "",
      cardNumberError: "",
      error: false,

      loading: false,
      url: import.meta.env.VITE_WEB_URL
    };
  },

  mounted() {
    this.setUpStripe();
  },

  methods: {
    moveBack() {
      console.log("moveBack")
      this.$emit('moveBack')
    },
    setUpStripe() {
      const stripe = Stripe(this.stripePublicKey);
      this.stripe = stripe;

      const elements = stripe.elements();
      this.cardCvc = elements.create("cardCvc");
      this.cardExpiry = elements.create("cardExpiry");
      this.cardNumber = elements.create("cardNumber");

      this.cardCvc.mount("#card-cvc");
      this.cardExpiry.mount("#card-expiry");
      this.cardNumber.mount("#card-number");

      this.listenForErrors();
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

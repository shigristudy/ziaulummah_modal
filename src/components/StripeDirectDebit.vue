<template>
  <div>
    <!-- Main Form Content - Show by default -->
    <div v-show="!loading && !isPaymentSuccess">
      <!-- Day of Month Selection -->
      <div v-show="!dayOfMonthConfirmed" class="my-6">
        <label class="block text-gray-700 text-sm font-bold mb-2" for="day_of_month">
          Day of Month
        </label>
        <span class="text-xs text-gray-500 block mb-2">Select the day of the month you would like to donate</span>
        <select v-model="day_of_month"
          class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none">
          <option :value="null">Same Date of Donation</option>
          <option value="-1">Last Day of Month</option>
          <option v-for="i in 28" :value="i">{{ ordinalSuffix(i) }}</option>
        </select>
        <span v-if="day_of_month_error" class="text-red-500 text-xs mt-1 block">{{ day_of_month_error }}</span>
        <button type="button" @click="confirmDayOfMonth"
          class="mt-4 w-full px-6 py-2.5 bg-red text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green hover:shadow-lg focus:bg-green focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green active:shadow-lg transition duration-300 ease-in-out">
          Confirm Day of Month
        </button>
      </div>

      <!-- Payment Form -->
      <form id="subscription-form" v-show="dayOfMonthConfirmed" class="mt-6">
        <div class="bg-gray-50 p-4 rounded-lg mb-4">
          <p class="text-sm text-gray-600">Selected payment date: 
            <span class="font-semibold">{{ day_of_month === -1 ? 'Last day' : ordinalSuffix(day_of_month) }}</span>
          </p>
        </div>

        <div class="block w-full px-3 py-1.5 bg-white border border-gray-300 rounded">
          <div id="payment-element"></div>
        </div>

        <div class="my-6 flex justify-between">
          <button type="button" @click="$emit('moveBack')"
            class="px-6 py-2.5 bg-gray-600 text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-gray-700 transition duration-300 ease-in-out flex items-center">
            <IconBack />
            Back
          </button>
          <button type="submit"
            class="px-6 py-2.5 bg-red text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green transition duration-300 ease-in-out flex items-center">
            Setup Direct Debit
            <IconForward />
          </button>
        </div>

        <div v-if="stripeError" class="mt-4 p-4 text-red border-red border rounded-lg mb-4">
          <p class="text-red-600 text-sm">
            {{ stripeError }}
          </p>
        </div>
      </form>
    </div>

    <!-- Loading State - Show only when loading -->
    <div v-if="loading" class="flex items-center justify-center flex-col p-6 bg-green text-white rounded-lg">
      <h1 class="text-green-700 font-bold mb-4">Processing Your Payment...</h1>
      <IconLoading />
    </div>

    <!-- Success State - Show only after successful payment -->
    <div v-else-if="isPaymentSuccess" class="flex items-center justify-center flex-col p-6 bg-green text-white rounded-lg">
      <div class="text-center mb-4">
        <svg class="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <h2 class="text-xl font-bold">Payment Successful!</h2>
        <p class="mt-2">{{ stripeSuccess }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import Api from "../services/api";
import IconBack from "./icons/IconBack.vue";
import IconForward from "./icons/IconForward.vue";
import IconLoading from "./icons/IconLoading.vue";
export default {
  props: ["amount", "form", "stripePublicKey", "donations"],
  components: {
    IconBack,
    IconForward,
    IconLoading
  },
  data() {
    return {
      stripe: null,
      elements: null,
      stripeError: "",
      stripeSuccess: "",
      error: false,
      loading: false,
      url: import.meta.env.VITE_WEB_URL,
      client_secret: "",
      waiting_for_redirect: false,
      day_of_month: null,
      day_of_month_error: "",
      dayOfMonthConfirmed: false,
      isPaymentSuccess: false,
    };
  },
  mounted() {
    // Reset all states on component mount
    this.loading = false;
    this.isPaymentSuccess = false;
    this.dayOfMonthConfirmed = false;
  },
  methods: {
    async confirmDayOfMonth() {

      if (this.day_of_month === null) {
        this.day_of_month_error = "Please select a day of the month";
        return;
      }

      if (localStorage.getItem('donation_id') === null) {
        await this.saveDonation();
      }

      this.dayOfMonthConfirmed = true;
      this.setupDirectDebit();
    },
    ordinalSuffix(i) {
      const j = i % 10,
        k = i % 100;
      if (j == 1 && k != 11) {
        return i + "st" + " of the month";
      }
      if (j == 2 && k != 12) {
        return i + "nd" + " of the month";
      }
      if (j == 3 && k != 13) {
        return i + "rd" + " of the month";
      }
      return i + "th" + " of the month";
    },
    async saveDonation() {
      this.form.donations = this.donations;
      let { data } = await Api.saveDonation(this.form);
      if (data.success == 0) {
        this.loading = false;
        // errorMessage.value = data.message;
        return;
      }

      if (data?.monthly_donation) {
        let donation_id = data.monthly_donation.id;
        localStorage.setItem('donation_id', donation_id);
      } else {
        console.error('something went wrong');
      }
    },
    async setupDirectDebit() {
      // Load Stripe.js
      this.stripe = Stripe(this.stripePublicKey);

      // Call your backend to create a PaymentIntent
      try {
        const { data } = await Api.createStripeIntentRequestBasc({
          amount: this.amount,
          currency: "GBP",
          form: this.form,
          donations: this.donations,
          donation_id: localStorage.getItem('donation_id')
        });

        this.client_secret = data.client_secret;

        // Initialize Elements with the client secret
        this.elements = this.stripe.elements({
          clientSecret: this.client_secret,
        });

        // Create and mount the Payment Element
        const paymentElement = this.elements.create("payment");
        paymentElement.mount("#payment-element");

        // Handle form submission
        const form = document.getElementById("subscription-form");
        form.addEventListener("submit", async (event) => {
          event.preventDefault();

          this.loading = true;
          this.stripeError = "";
          this.stripeSuccess = "";

          try {
            const { error, paymentIntent } = await this.stripe.confirmPayment({
              elements: this.elements,
              redirect: "if_required",
            });

            if (error) {
              this.stripeError = error.message;
              this.error = true;
            } else if (paymentIntent && paymentIntent.status == "processing") {
              await Api.completeSubscription({
                paymentIntent: paymentIntent,
                form: this.form,
                donations: this.donations,
                donation_id: localStorage.getItem('donation_id'),
                day_of_month: this.day_of_month,
                amount: this.amount,
                currency: "GBP",
              });

              this.isPaymentSuccess = true;
              this.stripeSuccess = "Your Direct Debit has been set up successfully! You will be redirected shortly.";
              
              setTimeout(() => {
                localStorage.removeItem('donation_id');
                this.$emit("stripePayment", paymentIntent);
              }, 2000);
            }
          } catch (error) {
            this.loading = false;
            this.stripeError = "An unexpected error occurred. Please try again.";
          } finally {
            this.loading = false;
          }
        });
      } catch (error) {
        console.error("Error creating PaymentIntent:", error);
        this.stripeError = "Failed to initialize payment. Please try again.";
      }
    }
  }
};
</script>

<style scoped>
/* Remove existing styles as they're now handled by Tailwind classes */
</style>
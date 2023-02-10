<template>
  <form
    @submit.prevent="handleDonation"
    v-if="current_donation.project"
    class=""
  >
    <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
      <input
        v-model="current_donation.amount"
        type="number"
        :class="{ 'outline outline-red': not_validated }"
        class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
        id="synergy-quick-amount"
        placeholder="Amount"
      />

      <select
        class="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
        id="donationType"
        v-model="current_donation.monthly"
        aria-label="Frequency"
      >
        <option :value="false">One Off</option>
        <option :value="true">Monthly</option>
      </select>

      <select
        class="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
        id="donationType"
        v-model="current_donation.donation_type_id"
        aria-label="Donation Type"
      >
        <option
          v-for="(donation_type, index) in current_donation.project
            .donation_types"
          :key="'donation_type_' + index"
          :value="donation_type.id"
        >
          {{ donation_type.name }}
        </option>
      </select>

      <button class="bg-red text-white font-bold rounded" type="submit">
        Donate Now
      </button>
    </div>

    <!-- <div id="payment-request-button"></div> -->
  </form>
</template>
<script>
import Api from "../services/api";
export default {
  props: [],
  data() {
    return {
      current_donation: {
        project_id: 0,
        donation_type_id: null,
        amount: null,
        monthly: false,
        fix_amount: 0,
        qty: 1,
        totalAmount: null,
        project: null,
      },
      not_validated: false,
    };
  },
  created() {
    this.getQuickDonationProject();
  },
  mounted() {
    // this.setUpStripe();
  },
  methods: {
    async getQuickDonationProject() {
      const { data } = await Api.getQuickDonationProject();
      this.current_donation.project = data;
      this.current_donation.donation_type_id = data.donation_types[0].id;
      this.current_donation.project_id = data.id;
    },
    handleDonation() {
      if (!this.validateDonation()) {
        this.not_validated = true;
        return;
      }
      this.not_validated = false;
      this.$emit("added", this.current_donation);

      this.current_donation.amount = null;
      this.current_donation.monthly = false;
    },
    validateDonation() {
      if (!this.current_donation.amount || this.current_donation.amount <= 0)
        return false;
      return true;
    },
    // setUpStripe() {
    //   const stripe = Stripe(
    //     "pk_test_51KEZblITpRY73U53TSXaNrW8Uj4zeIFKDFogBqAHeBFrqmtPgflNm5PY0gdbRStebJZnTvqe5GJhaZciHti7t20M00BMb5ZjIB"
    //   );
    //   this.stripe = stripe;

    //   const elements = stripe.elements();

    //   const paymentRequest = stripe.paymentRequest({
    //     country: "US",
    //     currency: "usd",
    //     total: {
    //       label: "Demo total",
    //       amount: 3000,
    //     },
    //     displayItems: [
    //       {
    //         label: "First",
    //         amount: 1000,
    //       },
    //       {
    //         label: "Second",
    //         amount: 2000,
    //       },
    //     ],
    //     requestPayerName: true,
    //     requestPayerEmail: true,
    //   });

    //   const prButton = elements.create("paymentRequestButton", {
    //     paymentRequest,
    //   });

    //   (async () => {
    //     // Check the availability of the Payment Request API first.
    //     const result = await paymentRequest.canMakePayment();
    //     console.log(result);
    //     if (result) {
    //       prButton.mount("#payment-request-button");
    //     } else {
    //       // document.getElementById('payment-request-button').style.display = 'none';
    //     }
    //   })();
    // },
  },
};
</script>

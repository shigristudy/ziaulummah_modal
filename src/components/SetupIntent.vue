<template>
    <div>
        <!-- Loading State -->
        <div :class="{ 'flex': loading, 'hidden': !loading }" class="bg-green items-center justify-center flex-col">
            <h1 class="text-white font-bold p-6">Waiting for Payment Process ....</h1>
            <IconLoading />
            <br />
        </div>

        <!-- Day of Month Selection -->
        <div class="my-6">
            <label class="block text-gray-700 text-sm font-bold" for="day_of_month">Day of Month</label>
            <span class="text-xs text-gray-500">Select the day of the month you would like to donate</span>
            <select v-model="day_of_month"
                class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none w-49">
                <option :value="null">Same Date of Donation</option>
                <option value="-1">Last Day of Month</option>
                <option v-for="i in 28" :value="i">{{ ordinalSuffix(i) }}</option>
            </select>
        </div>
        <span v-if="day_of_month_error" class="text-red-500 text-xs">{{ day_of_month_error }}</span>

        <!-- Confirm Day of Month Button -->
        <button id="submit-button" :disabled="loading" type="button" @click="confirmDayOfMonth"
            class="px-6 pt-2.5 pb-2 bg-red text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green hover:shadow-lg focus:bg-green focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
            Confirm Day of Month
        </button>

        <!-- Payment Form -->
        <form id="subscription-form" v-show="!loading">
            <div
                class="block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none">
                <div id="bacs-debit-element"></div>
            </div>

            <!-- Navigation Buttons -->
            <div class="my-6 flex justify-between">
                <button type="button" @click="$emit('moveBack')"
                    class="px-6 pt-2.5 pb-2 bg-gray-600 text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green hover:shadow-lg focus:bg-green focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
                    <IconBack />
                    Back
                </button>
                <button id="submit-button" :disabled="loading" type="submit"
                    class="px-6 pt-2.5 pb-2 bg-red text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green hover:shadow-lg focus:bg-green focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
                    Setup Direct Debit
                    <IconForward />
                </button>
            </div>

            <!-- Success and Error Messages -->
            <div v-if="stripeSuccess">
                <p class="text-green font-bold border-b-2 border-green">{{ stripeSuccess }}</p>
            </div>
            <div v-if="stripeError">
                <p class="text-red font-bold border-b-2 border-red">* {{ stripeError }}</p>
            </div>
        </form>
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
        IconLoading,
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
            day_of_month: null,
            day_of_month_error: "",
        };
    },
    methods: {
        // Confirm the selected day of the month
        async confirmDayOfMonth() {
            if (this.day_of_month === null) {
                this.day_of_month_error = "Please select a day of the month";
                return;
            }

            if (localStorage.getItem("donation_id") === null) {
                await this.saveDonation();
            }

            this.setupDirectDebit();
        },

        // Add ordinal suffix to the day of the month
        ordinalSuffix(i) {
            const j = i % 10,
                k = i % 100;
            if (j == 1 && k != 11) {
                return i + "st of the month";
            }
            if (j == 2 && k != 12) {
                return i + "nd of the month";
            }
            if (j == 3 && k != 13) {
                return i + "rd of the month";
            }
            return i + "th of the month";
        },

        // Save donation details to the backend
        async saveDonation() {
            this.form.donations = this.donations;
            let { data } = await Api.saveDonation(this.form);
            if (data.success == 0) {
                this.loading = false;
                return;
            }

            if (data?.monthly_donation) {
                let donation_id = data.monthly_donation.id;
                localStorage.setItem("donation_id", donation_id);
            } else {
                console.error("Something went wrong");
            }
        },

        // Setup Direct Debit payment
        async setupDirectDebit() {
            this.stripe = Stripe(this.stripePublicKey);

            try {
                const { data } = await Api.createStripeSetupIntentRequestBacs({
                    amount: this.amount,
                    currency: "GBP",
                    form: this.form,
                    donations: this.donations,
                    donation_id: localStorage.getItem("donation_id"),
                });

                this.client_secret = data.client_secret;

                // Initialize Elements with the client secret
                this.elements = this.stripe.elements({ clientSecret: this.client_secret });

                // Create and mount the BACS Debit Element
                const bacsDebitElement = this.elements.create("bacsDebit");
                bacsDebitElement.mount("#bacs-debit-element");

                // Handle form submission
                const form = document.getElementById("subscription-form");
                form.addEventListener("submit", async (event) => {
                    event.preventDefault();

                    this.loading = true;
                    this.stripeError = "";
                    this.stripeSuccess = "";

                    // Confirm the BACS Direct Debit SetupIntent
                    const { error, setupIntent } = await this.stripe.confirmBacsDebitSetup(this.client_secret, {
                        payment_method: {
                            bacs_debit: bacsDebitElement,
                            billing_details: {
                                name: this.form.name,
                                email: this.form.email,
                            },
                        },
                    });

                    if (error) {
                        this.stripeError = error.message;
                        this.error = true;
                        this.loading = false;
                    } else if (setupIntent && setupIntent.status === "succeeded") {
                        this.loading = false;
                        this.stripeSuccess = "Direct Debit setup successful!";
                        this.$emit("stripeSetupComplete", setupIntent);
                    }
                });
            } catch (error) {
                console.error("Error creating SetupIntent:", error);
                this.stripeError = "Failed to initialize payment. Please try again.";
            }
        }
    },
};
</script>

<style scoped>
/* Add custom styles if needed */
</style>
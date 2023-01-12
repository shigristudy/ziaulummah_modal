<template>
    <form @submit.prevent="handleDonation" v-if="current_donation.project" class="">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-2 p-4">
            <input
                v-model="current_donation.amount"
                type="number"
                class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
                id="other-amount"
                placeholder="Amount"
            />

            <select class="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none" id="donationType"
                v-model="current_donation.monthly" aria-label="Frequency">
                <option :value="false">One Off</option>
                <option :value="true">Monthly</option>
            </select>

            <select class="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none" id="donationType"
                v-model="current_donation.donation_type_id" aria-label="Donation Type">
                <option v-for="(donation_type,index) in current_donation.project.donation_types" :key="'donation_type_'+ index" :value="donation_type.id">{{ donation_type.name }}</option>
            </select>

            <button class="bg-red text-white font-bold rounded" type="submit">Donate Now</button>

        </div>
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
                donation_type_id:null,
                amount: null,
                monthly: false,
                fix_amount: 0,
                qty: 1,
                totalAmount: null,
                project: null
            },
        }
    },
    created() {
        this.getQuickDonationProject();
    },
    methods: {
        async getQuickDonationProject() {
            const { data } = await Api.getQuickDonationProject()
            this.current_donation.project = data
            this.current_donation.donation_type_id = data.donation_types[0].id
            this.current_donation.project_id = data.id
        },
        handleDonation() {
            this.$emit("added", this.current_donation);
        }
    }
}
</script>
<template>
    <div :class="{
        'flex': loading,
        'hidden': !loading
    }" class="bg-green items-center justify-center flex-col">
        <h1 class="text-white font-bold p-6">
            Waiting for Payment Process ....
        </h1>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
            style="margin: auto;display: block; shape-rendering: auto;" width="60px" height="60px" viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid">
            <circle cx="50" cy="50" fill="none" stroke="#FFFFFF" stroke-width="10" r="35"
                stroke-dasharray="164.93361431346415 56.97787143782138">
                <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s"
                    values="0 50 50;360 50 50" keyTimes="0;1">
                </animateTransform>
            </circle>
        </svg>
        <br>
    </div>
    <form v-if="!loading" class="flex flex-col items-center justify-center">
        <div
            class="block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none">
            <div v-if="form.payment_method === 'account'">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="account_number">
                        Account Number
                    </label>
                    <input
                        class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none w-49"
                        id="account_number" @keydown="onlyNumeric($event, 8)" type="text" placeholder="Account Number"
                        v-model="form.account_number">
                    <span class="text-red" v-if="errors.account_number">{{ errors.account_number[0] }}</span>
                </div>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="sort_code">
                        Sort Code
                    </label>
                    <input
                        class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none w-49"
                        id="sort_code" type="text" @keydown="onlyNumeric($event, 6)" placeholder="Sort Code"
                        v-model="form.sort_code">
                    <span class="text-red" v-if="errors.sort_code">{{ errors.sort_code[0] }}</span>
                </div>
                <a href="#" class="text-blue-500 mb-4" @click.prevent="togglePaymentMethod">or enter IBAN number instead</a>
            </div>
            <div v-else>
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="iban">
                        IBAN
                    </label>
                    <input
                        class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none w-49"
                        id="iban" type="text" placeholder="IBAN" v-model="form.iban">
                    <span class="text-red" v-if="errors.iban || errors.customer_bank_account">{{ errors.iban ? errors.iban[0] : errors.customer_bank_account[0] }}</span>
                </div>
                <a href="#" class="text-blue-500 mb-4" @click.prevent="togglePaymentMethod">or enter Account Number & Sort Code instead</a>
            </div>
            <!-- day_of_month -->
            <!-- <div class="my-6">
                <label class="block text-gray-700 text-sm font-bold" for="day_of_month">
                    Day of Month
                </label>
                <span class="text-xs text-gray-500 ">Select the day of the month you would like to donate</span>
                <select v-model="form.day_of_month"
                    class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none w-49">
                    <option :value="null">Same Date of Donation</option>
                    <option value="-1">Last Day of Month</option>
                    <option v-for="i in 28" :value="i">{{ ordinalSuffix(i) }}</option>
                </select>
            </div> -->
            <div class="my-6 flex justify-between">
                <button type="button" @click="moveBack()"
                    class="px-6 pt-2.5 pb-2 bg-gray-600 text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green hover:shadow-lg focus:bg-green focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-5 mr-3">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Back
                </button>
                <button @click.prevent="handleFormSubmit()" :disabled="loading" type="button"
                    class="px-6 pt-2.5 pb-2 bg-red text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green hover:shadow-lg focus:bg-green focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
                    Donate
                    <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor" class="w-5 ml-3">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                        style="margin: auto;display: block; shape-rendering: auto;" width="20px" height="20px"
                        viewBox="0 0 100 100" preserveAspectRatio="xMidYMid">
                        <circle cx="50" cy="50" fill="none" stroke="#FFFFFF" stroke-width="10" r="35"
                            stroke-dasharray="164.93361431346415 56.97787143782138">
                            <animateTransform attributeName="transform" type="rotate" repeatCount="indefinite" dur="1s"
                                values="0 50 50;360 50 50" keyTimes="0;1">
                            </animateTransform>
                        </circle>
                    </svg>
                </button>
            </div>
        </div>
        <div>
            <p class="text-green" v-if="successMessage">
                {{ successMessage }}
            </p>
        </div>
        <div>
            <p class="text-red" v-if="(errorMessage || errors.gocardless)">
                {{ errorMessage || errors.gocardless[0] }}
            </p>
        </div>
    </form>
</template>

<script setup>
import { onMounted, ref, toRefs } from 'vue';
import Api from "../services/api";
const emit = defineEmits(["moveBack", "completed"]);
const props = defineProps(["amount", "customer", "donations"]);
const { amount, customer, donations } = toRefs(props);
const successMessage = ref('');
const errorMessage = ref('');
const loading = ref(false);
const errors = ref([]);
const form = ref({
    payment_method: 'account',
    account_number: '',
    sort_code: '',
    iban: '',
    day_of_month: null
});

onMounted(() => {
    // Any initialization logic can go here
});

const onlyNumeric = (e, maxLength) => {
    try {
        if (maxLength && e.target.value.length >= maxLength && e.key !== 'Backspace' && e.key !== 'Tab') {
            e.preventDefault();
            return;
        }
        if (e.key.length === 1 && !/^[0-9]$/.test(e.key)) {
            e.preventDefault();
        }
    } catch (error) {
        console.error(error);
    }
}

const ordinalSuffix = (i) => {
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
}

const setupDirectDebit = async () => {
    try {
        const payload = {
            amount: amount.value,
            currency: customer.value.selected_currency,
            first_name: customer.value.first_name,
            last_name: customer.value.last_name,
            email: customer.value.email,
            company_name: customer.value?.company_name || '',
            address_line_1: customer.value.address_line_1,
            address_line_2: customer.value.address_line_2,
            city: customer.value.city,
            country_code: getCountryCode(customer.value.country),
            post_code: customer.value.post_code,
            day_of_month: form.value.day_of_month,
            id: localStorage.getItem('donation_id')
        };

        if (form.value.payment_method === 'account') {
            payload.account_number = form.value.account_number;
            payload.sort_code = form.value.sort_code;
        } else {
            payload.iban = form.value.iban;
        }

        const { data } = await Api.setupDirectDebit(payload);

        successMessage.value = data.data.message;
        localStorage.removeItem('donation_id');
        emit('completed');
    } catch (error) {
        console.log(error.response.data);
        errors.value = error.response.data.errors;
        loading.value = false;
        errorMessage.value = error.response.data.message;
    }
}

import countries from "../data/countries.json";
const getCountryCode = (name) => {
    const country = countries.find(c => c.name === name);
    if (country) {
        return country.code;
    }
    return 'GB';
}

const moveBack = () => {
    console.log('Move back');
    emit('moveBack');
}

const handleFormSubmit = async () => {
    loading.value = true;
    if (localStorage.getItem('donation_id') === null) {
        await saveDonation();
    }
    setupDirectDebit();
}

const saveDonation = async () => {
    customer.value.donations = donations;
    let { data } = await Api.saveDonation(customer.value);
    if (data.success == 0) {
        loading.value = false;
        errorMessage.value = data.message;
        return;
    }

    if (data?.monthly_donation) {
        let donation_id = data.monthly_donation.id;
        localStorage.setItem('donation_id', donation_id);
    } else {
        console.error('something went wrong');
    }
}

const togglePaymentMethod = () => {
    form.value.payment_method = form.value.payment_method === 'account' ? 'iban' : 'account';
}
</script>
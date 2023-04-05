<template>
   <div class="pointer-events-auto">
      <div class="flex h-full flex-col">
        <div class="flex-1 p-4 sm:px-10">
          <div class="flex items-start justify-between my-4">
            <div class="">
              <h2
                class="text-2xl font-bold text-gray-900 w-full"
                id="slide-over-title"
              >
              Add donation
              </h2>
              <p>Choose from the options below:</p>
              <div class="mt-2">
                <label for="select-currency">Select Currency</label>
                <select v-model="form.selected_currency"
                  class="ml-2 mt-1 form-select text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green dark:focus:border-black focus:outline-none" name="currency" id="select-currency">
                  <option value="GBP">GBP</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 py-6 px-4 sm:px-10" v-if="projects">
          <div class="mb-4">
            <label for="select-category" class="required text-green dark:text-black font-bold block mb-2 text-lg">Category</label>
            <select
              id="select-category"
              v-model="current_donation.category_id"
              @change="fetchProjects()"
              class="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
              aria-label="Categories"
            >
              <option :value="0">Select a Category</option>
              <option v-for="(cat,index) in categories" :key="'category_'+ index" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div class="mb-4">
            <label for="select-project" class="required text-green dark:text-black font-bold block mb-2 text-lg">Project</label>
            <select
              @change="projectChanged"
              id="select-project"
              v-model="current_donation.project_id"
              class="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white  focus:outline-none"
              aria-label="Projects"
              :class="{ '!border-red' : errors && errors.project_id}"
            >
            <option :value="0">Select a project</option>
            <option v-for="(project,index) in projects" :key="'project_'+ index" :value="project.id">{{ project.title }}</option>
            </select>
          </div>

          <div class="mb-4" v-if="donation_types && donation_types.donation_types">
            <label for="select-donation-type" class="required text-green dark:text-black font-bold block mb-2 text-lg">Donation Type</label>
            <select
              @change="addDonationType"
              id="select-donation-type"
              v-model="current_donation.donation_type_id"
              class="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
              aria-label="Donation Types"
              :class="{ '!border-red' : errors && errors.donation_type_id}"
             
            >
            <option value="">Select Donation Type</option>
            <option v-for="(type,index) in donation_types.donation_types" :key="'type_'+ index" :value="type.id">{{ type.name }}</option>
            </select>
          </div>

          
          <div class="mb-4">
            <label for="" class=" text-green dark:text-black font-bold block mb-2 text-lg" v-if="current_donation && current_donation.project">Frequency</label>
            <ul class="flex gap-2" v-if="current_donation && current_donation.project">
              <template v-for="(frequency,index) in frequencies" :key="index">
                <li class="relative">
                  <input
                  class="sr-only peer" :disabled="!checkIfAllowed(frequency.name)" type="radio" v-model="current_donation.monthly" name="frequency" :value="frequency.selected" :id="'frequency_'+index">
                  <label
                  :class="{
                    'cursor-not-allowed bg-gray-400 hover:bg-gray-500' : !checkIfAllowed(frequency.name),
                    'cursor-pointer' : checkIfAllowed(frequency.name),
                  }"
                  class="select-none flex px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none hover:bg-gray-50 peer-checked:ring-green dark:peer-checked:ring-black peer-checked:ring-2 peer-checked:border-transparent" 
                  :for="'frequency_'+index">{{ frequency.name }}</label>
                </li>
              </template>
            </ul>
          </div>
          
          <div class="mb-4" v-if="current_donation.project && current_donation.project.fix_amounts">
            <label for="select-amounts" class=" text-green dark:text-black font-bold block mb-2 text-lg" >Donation amount</label>
            <ul class="flex gap-2">
              <li class="relative" v-for="(amount,index) in current_donation.project.fix_amounts.split(',')" :key="index">
                <input class="sr-only peer" type="radio" v-model="current_donation.fix_amount" :value="parseFloat(amount)" name="amount" :id="'amount_'+amount">
                <label class="select-none flex px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none hover:bg-gray-50 peer-checked:ring-green dark:peer-checked:ring-black peer-checked:ring-2 peer-checked:border-transparent" :for="'amount_'+amount">{{ $formatAmount(amount) }}</label>
                <div class="absolute hidden w-5 h-5 peer-checked:block top-5 right-3"></div>
              </li>
            </ul>
          </div>
          
          <div class="mb-4" v-if="current_donation.project && current_donation.project.is_other_amount_allowed">
            <label
              for="other-amount"
              class="form-label inline-block mb-2 text-green dark:text-black font-bold"
              >Other Amount</label
            >
            <input
              v-model="current_donation.amount"
              type="number"
              class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
              id="other-amount"
              placeholder="Other Amount"
              :class="{ 'border !border-red-500' : errors && errors.donation_amount}"
            />
          </div>

          <div class="mb-4 flex justify-between">
            <button 
              @click="viewBasket()"
              type="button" class="p-2 md:px-6 pt-2.5 pb-2 bg-gray-600 text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green dark:hover:bg-black hover:shadow-lg focus:bg-green dark:focus:bg-black focus:shadow-lg focus:outline-none focus:ring-0 dark:active:bg-black active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"  class="w-4 mr-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              View Basket
            </button>
            <button 
              @click="addDonation"
              type="button" class="p-2 md:px-6 pt-2.5 pb-2 bg-red dark:bg-black text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green dark:hover:bg-gray-700 hover:shadow-lg focus:bg-green dark:focus:bg-gray-800 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green dark:active:bg-black active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
              Add Donation
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 ml-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            </button>
            
          </div>

          <ul v-if="!validated" class="list-disc px-6">
            <li class="text-red" v-for="(error,index) in errors" :key="'error'+index">{{ error }}</li>
          </ul>
          <div class="mb-4">
            <div v-if="show_alert" class="bg-green-100 border-2 border-teal-700 rounded-b text-teal-900 px-4 py-3 shadow-md" role="alert">
              <div class="flex items-center">
                <div class="py-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="font-bold ml-4">Donation Added to Basket</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
</template>


<script>
import Api from "../services/api";
import { current_donation } from "../data/resets"
export default {
  props:['form','currencies','donations'],
  data() {
    return {
      wordpress_page_id:"0",
      donation_amounts: [5, 10, 20, 50, 100],
      categories: null,
      projects: null,
      show_alert:false,
      current_donation: { ...current_donation },
      errors: {},
      validated: false,
      wordpressPageID: 0,
      
    }
  },
  created() {
    this.getWordpressCurrentPageID();
    this.fetchcategories()
  },
  methods: {
    projectChanged() {
      if(this.current_donation.project.default_frequency == 'monthly'){
        if(this.checkIfAllowed("Monthly")){
          this.current_donation.monthly = true
        }
      }else{
        if(this.checkIfAllowed("Single")){
          this.current_donation.monthly = false
        }
      }
      // Set Fix Amount First One
      let amounts = ( this.current_donation.project && this.current_donation.project.fix_amounts) ? this.current_donation.project.fix_amounts.split(',') : []

      if(amounts.length > 0){
        this.current_donation.fix_amount = amounts[0]
      }
    },
    checkIfAllowed(frequency) {
      if (this.current_donation && this.current_donation.project) {
        if (frequency == 'Single') {
          if(this.current_donation.project.allow_single) return true
        } else {
          if(this.current_donation.project.allow_monthly) return true
        }
      }
      return false
    },
    viewBasket() {
      this.$emit('viewBasket')
    },
    async getWordpressCurrentPageID() {
        var page_body = document.querySelector('body.page');

        var id = 0;

        if(page_body) {
            var classList = page_body.classList;
            classList.forEach(item => {
                if (item.indexOf('page-id') >= 0) {
                    var item_arr = item.split('-');
                    id =  item_arr[item_arr.length -1];
                    return false;
                }
            });
        }
      this.wordpress_page_id = id;
      return id
    },
    async fetchcategories() {
      const { data } = await Api.fetchCategories()
      this.categories = data

      const id = await this.getWordpressCurrentPageID();
      this.wordpressPageID = String(id)
      this.categories.forEach(cat => {
        if (cat.wordpress_page_id && cat.wordpress_page_id.split(',').includes(this.wordpressPageID)) {
          this.current_donation.category_id = cat.id
          this.fetchProjects()
        }
      });
      if (!this.current_donation.category_id) {
        this.current_donation.category_id = this.categories[0].id
        this.fetchProjects()
      }
    },  
    async fetchProjects() {
      this.current_donation.project_id = 0
      if(!this.current_donation.category_id) return 

      const { data } = await Api.fetchProjects(this.current_donation.category_id)
      this.projects = data.projects
      // this.current_donation.project_id 

      // const pagedProject = this.projects.find((value, index) => {
      //   return value.wordpress_page_id == this.wordpress_page_id
      // })
      
      // if (!pagedProject) return;

      // this.current_donation.project_id = pagedProject.id
      // this.current_donation.project = pagedProject
    },
    addDonation() {
      
      if(!this.validateStep()) return

      this.show_alert = true
      setTimeout(() => {
        this.show_alert = false
      },5000)
      this.$emit('added', this.current_donation)
      this.current_donation = { ...current_donation }
    },
    validateStep() {
      this.validated = true
      this.errors = {};
      
      if (!this.current_donation.project_id) {
        this.errors.project_id = "Project is required.";
        this.validated = false;
      }
      if (!this.current_donation.donation_type_id) {
        this.errors.donation_type_id = "Donation Type is required.";
        this.validated = false;
      }

      if (this.current_donation.monthly == undefined || this.current_donation.monthly == null) {
        this.errors.donation_type_id = "Donation Frequency is required.";
        this.validated = false;
      }

      if (this.all_one_off && this.current_donation.monthly) {
        this.errors.logical_error = "You cannot add a monthly donation if a single donation is added into your basket. Please remove the single donation first"
        this.validated = false;
      } else if (this.all_monthly && !this.current_donation.monthly) {
        this.errors.logical_error = "You cannot add a single donation if a monthly donation is added into your basket. Please remove the monthly donation first" 
        this.validated = false;
      }

      if (this.current_donation.amount == 0 || !this.current_donation.amount) {
        if (!this.current_donation.fix_amount) {
          this.errors.donation_amount = "Please Enter Amount.";
          this.validated = false;
        }
      }

      return this.validated
    },
    $formatAmount(amount) {
      // this.currencies[this.form.selected_currency]
      return this.currencies[this.form.selected_currency] + parseFloat(amount).toFixed(2);
    },
  },
  computed: {
    donation_types() {
      if(!this.projects) return [];
      let obj = this.projects.find(o => o.id === this.current_donation.project_id);
      this.current_donation.project = obj
      return obj;
    },
    all_monthly() {
      if(this.donations.length == 0) return false
      return this.donations.every((item) => item.monthly)
    },
    all_one_off() {
      if(this.donations.length == 0) return false
      return this.donations.every((item) => !item.monthly)
    },
    frequencies() {
      return [{
        name: 'Single',
        selected: false
      },{
        name: 'Monthly',
        selected: true
      }]
      
      if (this.all_monthly) {
        return [{
            name: 'Monthly',
            selected: true
        }]     
      } else if(this.all_one_off) {
        return [{
            name: 'Single',
            selected: false
        }]     
        
      } else {
        return [{
          name: 'Single',
          selected: false,
          disabled: false
        },{
          name: 'Monthly',
          selected: true,
          disabled:false
        }]
      }
    }
  }
};
</script>

<style scoped>
[type=button], [type=submit], button {
  border: unset !important;
}

</style>
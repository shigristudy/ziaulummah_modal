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
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 py-6 px-4 sm:px-10" v-if="projects">
          <!-- <div class="mb-4">
            <label for="select-category" class=" text-green font-bold block mb-2 text-lg">Select Category</label>
            <select
              id="select-category"
              v-model="current_donation.category_id"
              @change="fetchProjects()"
              class="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
              aria-label="Default select example"
            >
              <option :value="0">Select a Category</option>
              <option v-for="(cat,index) in categories" :key="'category_'+ index" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div> -->

          <div class="mb-4">
            <label for="select-project" class=" text-green font-bold block mb-2 text-lg">Select Project</label>
            <select
              id="select-project"
              v-model="current_donation.project_id"
              class="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
              aria-label="Default select example"
            >
            <option :value="0">Select a project</option>
            <option v-for="(project,index) in projects" :key="'project_'+ index" :value="project.id">{{ project.title }}</option>
            </select>
          </div>

          <div class="mb-4" v-if="donation_types && donation_types.donation_types">
            <label for="select-donation-type" class=" text-green font-bold block mb-2 text-lg">Select Donation Type</label>
            <select
              @change="addDonationType"
              id="select-donation-type"
              v-model="current_donation.donation_type_id"
              class="form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
              aria-label="Default select example"
            >
            <option value="">Select Donation Type</option>
            <option v-for="(type,index) in donation_types.donation_types" :key="'type_'+ index" :value="type.id">{{ type.name }}</option>
            </select>
          </div>

          
          <div class="mb-4">
            <label for="" class=" text-green font-bold block mb-2 text-lg">Frequency</label>
            <ul class="flex gap-2">
              <li class="relative" v-for="(frequency,index) in frequencies" :key="index">
                <input class="sr-only peer" type="radio" v-model="current_donation.monthly" name="frequency" :value="frequency.selected" :id="'frequency_'+index">
                <label class="flex px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none hover:bg-gray-50 peer-checked:ring-green peer-checked:ring-2 peer-checked:border-transparent" :for="'frequency_'+index">{{ frequency.name }}</label>
                <div class="absolute hidden w-5 h-5 peer-checked:block top-5 right-3"></div>
              </li>
            </ul>
          </div>
          
          <div class="mb-4" v-if="current_donation.project && current_donation.project.fix_amounts">
            <label for="select-amounts" class=" text-green font-bold block mb-2 text-lg" >Donation amount</label>
            <ul class="flex gap-2">
              <li class="relative" v-for="(amount,index) in current_donation.project.fix_amounts.split(',')" :key="index">
                <input class="sr-only peer" type="radio" v-model="current_donation.fix_amount" :value="parseFloat(amount)" name="amount" :id="'amount_'+amount">
                <label class="flex px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none hover:bg-gray-50 peer-checked:ring-green peer-checked:ring-2 peer-checked:border-transparent" :for="'amount_'+amount">£{{ amount }}</label>
                <div class="absolute hidden w-5 h-5 peer-checked:block top-5 right-3"></div>
              </li>
            </ul>
          </div>
          
          <div class="mb-4">
            <label
              for="other-amount"
              class="form-label inline-block mb-2 text-green font-bold"
              >Other Amount</label
            >
            <input
              v-model="current_donation.amount"
              type="number"
              class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
              id="other-amount"
              placeholder="Other Amount"
            />
          </div>

          <div class="mb-4">
            <button 
              @click="addDonation"
              type="button" class="px-6 pt-2.5 pb-2 bg-red text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green hover:shadow-lg focus:bg-green focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
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
  data() {
    return {
      wordpress_page_id:0,
      donation_amounts: [5, 10, 20, 50, 100],
      categories: null,
      projects: null,
      show_alert:false,
      current_donation: { ...current_donation },
      errors: {},
      validated: false,
      wordpressPageID: 0,
      frequencies: [
        {
          name: 'One-Off',
          selected:false
        },
        {
          name: 'Montly',
          selected:true
        }
      ]
    }
  },
  created() {
    this.getWordpressCurrentPageID();
    this.fetchProjects()
  },
  methods: {
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
        this.wordpress_page_id = 1//parseInt(id);
    },
    // async fetchcategories() {
    //   const { data } = await Api.fetchCategories()
    //   this.categories = data

    //   const id = await this.getWordpressCurrentPageID();
    //   this.wordpressPageID = id

    //   this.categories.forEach(cat => {
    //     if (cat.wordpress_page_id == this.wordpressPageID) {
    //       this.current_donation.category_id = cat.id
    //       this.fetchProjects()
    //     }
    //   });

    //   console.log("current donation" ,this.current_donation)
    // },  
    async fetchProjects() {
      const { data } = await Api.fetchAllProjects()
      this.projects = data

      const pagedProject = this.projects.find((value, index) => {
        return value.wordpress_page_id == this.wordpress_page_id
      })
      this.current_donation.project_id = pagedProject.id
      this.current_donation.project = pagedProject
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

      return this.validated
    }
  },
  computed: {
    donation_types() {
      if(!this.projects) return [];
      let obj = this.projects.find(o => o.id === this.current_donation.project_id);
      this.current_donation.project = obj
      return obj;
    },
  }
};
</script>
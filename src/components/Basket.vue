<template>
  <div class="pointer-events-auto">
    <div class="flex h-full flex-col bg-gray-100">
      <div class="basket" v-if="step == 1">
        <div class="flex-1 py-6 px-4 sm:px-6">
          <div class="flex items-start justify-between my-4">
            <div class="">
              <h2 class="text-2xl font-bold text-gray-900 w-full" id="slide-over-title">
                Your Donation
              </h2>
              <p>See the details of your donation below:</p> 
            </div>
          </div>
          <hr>
          <div class="mt-8">
            <div class="flow-root">
              <ul role="list" class="" v-if="donations.length">
                <template v-for="(donation,index) in donations"  :key="'donation_' + index">
                  <li 
                    v-if="donation.project"
                    class="basket-cards-list flex py-4 px-2 !border-2 !border-green dark:!border-black mb-2 bg-white">
                    <div class="flex flex-1 flex-col">
                      <div>
                        <div
                          class="flex justify-between text-base font-bold text-gray-900"
                        >
                          <h3 class="text-green dark:text-black text-lg">{{ donation.project.title }}</h3>
                          <p class="ml-4 text-lg">{{ $formatAmount((donation.amount) ? donation.amount : donation.fix_amount) }}</p>
                        </div>
                        <p class="mt-1 text-sm text-gray-700">{{ donationType(donation.project,donation.donation_type_id) }}</p>
                      </div>
                      <div class="flex flex-1 items-end justify-between text-sm">
                        <p class="text-gray-700">{{ (donation.monthly) ? "Monthly Donation" : "One-Off" }}</p>
                        <div class="flex">
                          <!-- <button
                            type="button"
                            class="font-medium text-green"
                          >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          </button> -->
                          <button
                            @click="removeItem(index)"
                            type="button"
                            class="font-medium text-red hover:bg-transparent border-none p-0"
                          >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                </template>
              </ul>
              <div v-else>
                Basket Is Empty
              </div>
            </div>
          </div>
        </div>
        <div class="mb-4 px-4 sm:px-6">
          <ul class="flex gap-2">
            <li class="basket-cards-list relative w-1/2 flex flex-col justify-center items-center border-2 border-green dark:border-black p-4 bg-white">
              <h2 class="font-bold text-lg text-green dark:text-black mb-1">Paper Copy of Receipt</h2>
              <input type="hidden" :value="paper_copy_amount">
              <p class="font-bold text-lg mb-1">{{ $formatAmount(paper_copy_amount) }}</p>
              <input class="sr-only peer" type="checkbox" v-model="isSelectedPaperCopy" id="admin_fee_cover" @change="addCustomProject('paper_copy')">
              <label for="admin_fee_cover" 
                :class="{
                  'bg-red': isSelectedPaperCopy,
                  'bg-gray-600 hover:bg-red dark:hover:bg-black': !isSelectedPaperCopy
                }"
                class="px-6 pt-2.5 pb-2 bg-red text-white font-medium text-xs leading-normal uppercase rounded shadow-md transition duration-300 ease-in-out flex align-center items-center peer-checked:ring-green peer-checked:ring-2 peer-checked:border-transparent">
                {{ (isSelectedPaperCopy) ? 'Selected' : 'Not Selected' }}
                <svg v-if="isSelectedPaperCopy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 ml-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
                </svg>
              </label>
              <div class="absolute hidden w-5 h-5 peer-checked:block top-5 right-3"></div>
            </li>
  
            <li class="basket-cards-list relative w-1/2 flex flex-col justify-center items-center border-2 border-green dark:border-black p-4 bg-white">
              <h2 class="font-bold text-lg text-green dark:text-black mb-1">Admin Fee Cover</h2>
              <input type="hidden" :value="admin_fee_amount" >
              <p class="font-bold text-lg mb-1">{{ $formatAmount(admin_fee_amount) }}</p>
              <input class="sr-only peer" type="checkbox" v-model="isAdminFeeSelected" id="paper_copy" @change="addCustomProject('admin_fee')">
              <label for="paper_copy" 
                :class="{
                  'bg-red': isAdminFeeSelected,
                  'bg-gray-600 hover:bg-red dark:hover:bg-black': !isAdminFeeSelected
                }"
                class="px-6 pt-2.5 pb-2 bg-red text-white font-medium text-xs leading-normal uppercase rounded shadow-md transition duration-300 ease-in-out flex align-center items-center peer-checked:ring-green peer-checked:ring-2 peer-checked:border-transparent">
                {{ (isAdminFeeSelected) ? 'Selected' : 'Not Selected' }}
                <svg v-if="isAdminFeeSelected" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 mr-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 ml-2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
                </svg>
              </label>
              <div class="absolute hidden w-5 h-5 peer-checked:block top-5 right-3"></div>
            </li>
          </ul>
        </div>
        <hr>
        <div class="py-6 px-4 sm:px-6">
          <div class="flex justify-between text-base font-medium text-gray-900">
            <p>Donation Total:</p>
            <p>{{ $formatAmount(totalDonation) }}</p>
          </div>
          <div class="flex justify-between text-base font-medium text-gray-500" v-if="isSelectedPaperCopy">
            <p>Paper Copy of Reciept:</p>
            <p>{{ $formatAmount(paper_copy_amount) }}</p>
          </div>
          <div class="flex justify-between text-base font-medium text-gray-500" v-if="isAdminFeeSelected">
            <p>Admin Fee Cover:</p>
            <p>{{ $formatAmount(admin_fee_amount) }}</p>
          </div>
          <div class="flex justify-between text-base font-medium text-gray-900 mb-4">
            <p>Total Donation:</p>
            <p>{{ $formatAmount(totalAmount) }}</p>
          </div>
          <hr>
          <div class="flex justify-between text-base font-medium text-gray-900 mt-4">
            <p>Thereafter per month:</p>
            <p>{{ $formatAmount(totalMonthlyDonationThereAfter) }}</p>
          </div>
          <div class="mt-6 flex justify-between">
            <button type="button" @click="makeAnother()" class="bg-green dark:bg-black px-2 md:px-6 pt-2.5 pb-2 text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green dark:hover:bg-black hover:shadow-lg focus:bg-green dark:focus:bg-black focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green dark:active:bg-black active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 md:w-5 mr-1 md:mr-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add More
            </button>
            
            <button :disabled="!donations.length" type="button" @click="moveForward()" :class="{
              'bg-gray-400 cursor-not-allowed hover:bg-gray-400' : !donations.length,
              'bg-red' : donations.length
            }" class="px-2 md:px-6 pt-2.5 pb-2 text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green dark:hover:bg-black hover:shadow-lg focus:bg-green dark:focus:bg-black focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green dark:active:bg-black active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
                Proceed to Checkout
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 ml-1 md:ml-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              </button>
          </div>
         
        </div>
      </div>

      <div class="checkout px-6" v-if="step == 2">
        <div class="flex-1 py-6">
          <div class="flex items-start justify-between my-4">
            <div class="">
              <h2 class="text-2xl font-bold text-gray-900 w-full" id="slide-over-title">
                Your Donation
              </h2>
              <p>See the details of your donation below:</p> 
            </div>
          </div>
        </div>
        <hr>
        <p class="my-4">Personal Information</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
          <input
            placeholder="First Name"
            v-model="form.first_name"
            class="w-full form-control block px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
          />
          <input
            placeholder="Last Name"
            v-model="form.last_name"
            class="w-full form-control block px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none w-49"
          />
        </div>
        <input
          placeholder="Address Line 1"
          v-model="form.address_line_1"
          class="mb-2 form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
        />
        <input
          placeholder="Address Line 2"
          v-model="form.address_line_2"
          class="mb-2 form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
        />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
          <input
            placeholder="City"
            v-model="form.city"
            class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none w-50 input-left"
          />
          <input
            placeholder="Postal Code/Zip Code"
            v-model="form.post_code"
            class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none w-49"
          />
        </div>
        <select
          name="project"
          id=""
          placeholder="Select a country"
          v-model="form.country"
          class="mb-2 form-select block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
        >
          <option value="0">Country</option>
          <option
            v-for="(country, i) in countries"
            :key="i"
            :value="country.name"
          >
            {{ country.name }}
          </option>
        </select>
        <input
          type="email"
          placeholder="Email Address"
          v-model="form.email"
          class="mb-2 form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
        />
        <input
          @keypress="onlyNumber"
          placeholder="Phone Number"
          v-model="form.phone"
          class="mb-2 form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
        />
        <p class="my-4">Additional Information</p>
        <input
          placeholder="Reason For Donation (Optional)"
          v-model="form.reason"
          class="mb-2 form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
        />
        <textarea
          class="mb-2 form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
          placeholder="Notes (On behalf of)"
          v-model="form.notes"
          rows="3"
        ></textarea>

        <div class="border-green border p-3 mt-4">
          <div class="flex">
            <div class="w-9/12">
              <p class="font-bold text-gray-900 mb-2">
                Increase the value of your fundraiser <br />
                donation by 25%
              </p>
              <p class="text-gray-500 mb-2">
                With Gift Aid, your donation of {{ $formatAmount(50.00) }} would be worth {{ $formatAmount(62.50) }}
                at no extra cost to you.
              </p>
            </div>
            <div class="w-1/4">
              <img :src="assets('sign.png')" />
            </div>
          </div>
          <div class="font-normal text-sm bg-gray-200 p-3 mb-2">
            <p>
              I am a UK taxpayer and I understand that if I pay less Income
              and/or Capital Gains Tax than the amount of Gift Aid claimed
              on all my donations in the relevant tax year, it is my
              responsibility to pay any difference. I understand that Gift
              Aid will fund administrative costs as well as our charitable
              programmes.
            </p>
          </div>
          <div class="mb-2 flex gap-1">
            <input
              id="agreed"
              type="checkbox"
              v-model="form.gift_aid"
              :value="1"
            />
            <label for="agreed" class="ml-1"
              >I agree, I would like to boost my donation with Gift Aid
            </label>
          </div>
        </div>

        <div class="my-2">
          <label for="select-currency">I would like to be contacted via</label>
          <div class="grid grid-cols-2">
            <div class="form-check">
              <input v-model="form.contact_medium" value="Post" type="checkbox" name="contact_medium" id="contact_medium_1">
              <label class="ml-2" for="contact_medium_1">
                Post
              </label>
            </div>
            <div class="form-check">
              <input v-model="form.contact_medium" value="Email" type="checkbox" name="contact_medium" id="contact_medium_2">
              <label class="ml-2" for="contact_medium_2">
                Email
              </label>
            </div>
            <div class="form-check">
              <input v-model="form.contact_medium" value="Phone" type="checkbox" name="contact_medium" id="contact_medium_3">
              <label class="ml-2" for="contact_medium_3">
                Phone
              </label>
            </div>
            <div class="form-check">
              <input v-model="form.contact_medium" value="SMS" type="checkbox" name="contact_medium" id="contact_medium_4">
              <label class="ml-2" for="contact_medium_4">
                SMS
              </label>
            </div>
          </div>
        </div>
        <hr>
        <div class="my-2 flex">
          <input
            id="synergidigital-accept-terms-business"
            type="checkbox"
            v-model="form.terms_agreement"
            :value="1"
          />
          <label for="synergidigital-accept-terms-business" class="ml-1">
            By checking this box, you are agreeing to our <a target="__blank" :href="policyLink" class=" text-red">terms of service</a>
          </label>
        </div>
        <hr>
        <div class="mt-4">
          <p class="font-bold">Choose Payment Method</p>
          
          <div class="flex gap-6 flex-col">
            <div class="flex gap-2" v-if="isGatewayEnabled('stripe') && (containsOneOff && hasMonthly) || containsOneOff">
              <input
                id="radio1"
                type="radio"
                v-model="form.payment_type"
                name="method"
                value="Credit Card"
              />
              <label
                for="radio1"
                class="flex gap-1 items-center"
              >
                <IconCreditCard />
                Credit/Debit Card</label
              >
            </div>
            
            <div class="flex gap-2" v-if="isGatewayEnabled('paypal') && !hasMonthly">
              <input
                :disabled="hasMonthly"
                id="radio2"
                type="radio"
                v-model="form.payment_type"
                value="PayPal"
                name="method"
              />
              <label
                for="radio2"
                class="flex gap-1 items-center"
              >
                <IconPaypalCard />
                <span v-if="hasMonthly" class="text-danger text-sm"
                  >Paypal is not available if any subscription product exist
                  in your basket</span
                >
                <span v-else>Paypal</span>
              </label>
            </div>

            <div class="flex gap-2" v-if="isGatewayEnabled('gocardless') && !containsOneOff">
              <input
                :disabled="containsOneOff"
                id="radio3"
                type="radio"
                v-model="form.payment_type"
                name="method"
                value="Gocardless"
              />
              <label
                for="radio3"
                class="flex gap-1 items-center"
              >
                <IconCreditCard />
                Direct Debit</label
              >
            </div>

          </div>
        </div>
        <ul v-if="errors" class="list-disc px-6" ref="errorsRefs">
          <li class="text-red" v-for="(error,index) in errors" :key="'error'+index">{{ error }}</li>
        </ul>
        <div class="my-6 flex justify-between">
            <button type="button" @click="moveBack()" class="px-2 md:px-6 pt-2.5 pb-2 bg-gray-600 text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green dark:hover:bg-black hover:shadow-lg focus:bg-green dark:focus:bg-black focus:shadow-lg focus:outline-none focus:ring-0 dark:active:bg-black active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 mr-1 md:mr-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Back

            </button>
            <!-- :class="{''}" -->
            <button type="button" @click="moveForward()"
              class="px-2 md:px-6 pt-2.5 pb-2 bg-red text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green dark:hover:bg-black hover:shadow-lg focus:bg-green dark:focus:bg-black focus:shadow-lg focus:outline-none focus:ring-0 dark:active:bg-black active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
              Proceed to Payment
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 ml-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            </button>
          </div>
      </div>
        
      <div class="checkout px-6" v-if="step == 3">
        <div class="flex-1 py-6">
          <div class="flex items-start justify-between my-4">
            <div class="">
              <h2 class="text-2xl font-bold text-gray-900 w-full" id="slide-over-title">
                Your Donation
              </h2>
              <p>Please complete the donation process</p> 
            </div>
          </div>
        </div>
        <hr>
       
        <Paypal
          @moveBack="moveBack()"
          :donations="donations"
          :paypalPublicKey="getGatewayPublicKey('paypal')"
          :form="form"
          :currencies="currencies"
          :amount="totalAmount"
          @PaymentFailed="PaypalPaymentFailed"
          @PaymentSuccess="PaypalPaymentSuccess"
          v-if="form.payment_type == 'PayPal'"
        />

        <Gocardless
          v-else-if="form.payment_type =='Gocardless'"
          @moveBack="moveBack()"
          @completed="goCardlesscompleted"
          :amount="totalAmount"
          :form="form"
          :donations="donations"
        />
        
        <Stripe
          v-else
          @moveBack="moveBack()"
          @stripePayment="stripePayment"
          :amount="totalAmount"
          :stripePublicKey="getGatewayPublicKey('stripe')"
          :customer="form"
        />

        <!-- <div class="my-6 flex justify-between">
          <button type="button" @click="moveBack()" class="px-6 pt-2.5 pb-2 bg-gray-600 text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green hover:shadow-lg focus:bg-green focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 mr-3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Back
          </button>
        </div> -->
      </div>
      <div class="thank-you px-6" v-if="step == 4">
        <div class="flex-1 py-6">
          <div class="flex items-center justify-center my-4">
            <div class="">
              <h2 class="text-2xl font-bold text-gray-900 w-full flex justify-center" id="slide-over-title">
                <IconCheck />
              </h2>
              <h1>Your donation was successful!</h1> 
            </div>
          </div>
        </div>
        <div class="flex justify-center">
          <button type="button" @click="makeAnother()" class="px-6 pt-2.5 pb-2 bg-gray-600 text-white font-medium text-xs leading-normal uppercase rounded shadow-md hover:bg-green dark:hover:bg-black hover:shadow-lg focus:bg-green dark:focus:bg-black focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green dark:active:bg-black active:shadow-lg transition duration-300 ease-in-out flex align-center items-center">
            Make Another Donation
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Api from "../services/api";
import countries from "../data/countries.json";
import IconCreditCard from "../components/icons/IconCreditCard.vue";
import IconPaypalCard from "../components/icons/IconPaypalCard.vue";
import IconCheck from "../components/icons/IconCheck.vue";
import Paypal from "../components/Paypal.vue";
import Stripe from "../components/Stripe.vue";
import Gocardless from "../components/Gocardless.vue";
export default {
  props: [
    'donations',
    'form',
    'stripePublicKey',
    'currencies',
    'gateways'
  ],
  components: {
    IconCreditCard,
    IconPaypalCard,
    IconCheck,
    Stripe,
    Paypal,
    Gocardless,
  },
  data() {
    return {
      step: 1,
      countries: countries,
      errors: {},
      // isSelectedPaperCopy:false,
      // isAdminFeeSelected: false,
      paper_copy_amount:3,
      admin_fee_amount: 5,
      // donationTotal:0,
      // totalDonation: 0,
      policyLink:''
    }
  },
  mounted() {
    this.policyLink = (window.location.host == 'musafir.org.uk') ? 'https://www.musafir.org.uk/policies/' : 'https://www.ziaulummahfoundation.org.uk/policies/'
  },
  methods: {
    getGatewayPublicKey(gateway) {
      let p_gateway = this.gateways.find((payment) => (payment.gateway == gateway))
      if (!p_gateway) return "";

      return p_gateway.public_key
    },
    isGatewayEnabled(gateway) {
      let p_gateway = this.gateways.find((payment) => (payment.gateway == gateway))
      return (p_gateway.is_enabled == 1) ? true : false
    },
    makeAnother() {
      this.step = 1
      this.$emit('addAnotherDonation')
    },
    assets(asset) {
      return Api.assets(asset);
    },
    moveBack() {
      this.step--;
    },
    moveForward() {
      // console.log(this.step,this.validateStep())
      if(!this.validateStep()) return

      this.step++;
    },
    validateStep() {
      
      this.errors = {};
      let validated = true;
      if (this.step == 2) {
        if (!this.form.first_name) {
          this.errors.first_name = "First Name  is required.";
          validated = false;
        }
        if (!this.form.last_name) {
          this.errors.last_name = "Last Name  is required.";
          validated = false;
        }
        if (!this.form.email) {
          this.errors.email = "Email  is required.";
          validated = false;
        }
        if (!this.form.phone) {
          this.errors.phone = "Phone  is required.";
          validated = false;
        }
        if (!this.form.address_line_1) {
          this.errors.address_line_1 = "Address  is required.";
          validated = false;
        }
        if (!this.form.city) {
          this.errors.city = "City  is required.";
          validated = false;
        }
        if (!this.form.country) {
          this.errors.country = "Country  is required.";
          validated = false;
        }
        if (!this.form.post_code) {
          this.errors.post_code = "Postal Code  is required.";
          validated = false;
        }

        if (!this.form.terms_agreement) {
          this.errors.terms_agreement = "Please Agree Terms and Condition";
          validated = false;
        }

        if (!this.form.payment_type) {
          this.errors.payment_method = "Please Choose a Payment Method"
          validated = false
        }
      }

      return validated
    },
    donationType(project,donation_type_id) {
      const donation = project.donation_types.find(o => o.id === donation_type_id)
      if(!donation) return ""
      return donation.name;
    },
    async PaypalPaymentFailed(error) {
      console.log(error);
    },
    addCustomProject(type) {
      // if (type == "admin_fee") {
      //   this.$emit('toggleCustomProject',type,this.isAdminFeeSelected)
      // } else {
      //   this.$emit('toggleCustomProject',type,this.isSelectedPaperCopy)
      // }
    },
    removeItem(index) {
      this.$emit('removeItem',index)
      localStorage.setItem('synergi-zuf-donations', JSON.stringify(this.donations))
      const propsUpdatedEvent = new Event('propsUpdated'); window.dispatchEvent(propsUpdatedEvent);
    },
    goCardlesscompleted(res) {
      // if (pay.data.success) {
        this.initAgain();
        this.moveForward()
      // }
    },
    async stripePayment(payment_intent) {
      this.form.donations = this.donations
      let { data } = await Api.saveDonation(this.form);
      if (data.success) {
        this.initAgain();
        this.moveForward()
      }

      return;
      if (data.success == true) {
        let payment = {};
        payment.payment_intent = payment_intent;
        payment.name = this.form.first_name;
        payment.email = this.form.email;
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
        let pay = await Api.makePayment(payment);
        console.log(pay)
        if (pay.data.success) {
          // this.initAgain();
          // this.moveForward()
        } else {
          this.errors.authentication = pay.data.message
        }
      }
    },
    async PaypalPaymentSuccess(response) {
      this.form.donations = this.donations
      let { data } = await Api.saveDonation(this.form);

      this.initAgain();
      this.moveForward()
    },
    async PaypalPaymentFailed(error) {
      console.log(error);
    },
    initAgain() {
      this.$emit('initAgain',this.totalAmount)
    },
    $formatAmount(amount) {
      // this.currencies[this.form.selected_currency]
      return this.currencies[this.form.selected_currency] + parseFloat(amount).toFixed(2);
    },
  },
  
  computed: {
    hasMonthly() {
      return this.donations.some((d) => d.monthly);
    },
    containsOneOff() {
      if (this.isAdminFeeSelected) return true
      if (this.isSelectedPaperCopy) return true
      return this.donations.some((d) => !d.monthly)
    },
    isAdminFeeSelected: {
      get() {
        return this.form.admin_fee_cover
      },
      set(val) {
        this.$emit('toggleCustomProject','admin_fee',val)
      }
    },
    isSelectedPaperCopy: {
      get() {
        return this.form.paper_copy
      },
      set(val) {
        this.$emit('toggleCustomProject','paper_copy',val)
      }
    },
    totalDonation() {

      if (this.donations.length <= 0) return 0

      const total = this.donations.reduce((accumulator, currentValue) => {
        const amount = currentValue.amount ?? currentValue.fix_amount
        return accumulator + amount
      }, 0)
      
      return total
    },
    totalMonthlyDonationThereAfter() {

      if (this.donations.length <= 0) return 0

      const total = this.donations.reduce((accumulator, currentValue) => {
        if (currentValue.monthly) {
          const amount = currentValue.amount ?? currentValue.fix_amount
          return accumulator + amount
        }
        return accumulator;
      }, 0)
      
      return total
    },
    totalAmount() {
      const a = this.isAdminFeeSelected ? this.admin_fee_amount : 0
      const b = this.isSelectedPaperCopy ? this.paper_copy_amount : 0
      const total =  this.totalDonation + a + b
      this.$emit('totalAmount', total)
      return total
    }
  }
}
</script>

<style scoped>
[type=button], [type=submit], button {
  border: unset !important;
}

li.basket-cards-list{
  border: 1px solid !important;
}
</style>
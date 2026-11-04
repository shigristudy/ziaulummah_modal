<template>
  <div class="relative mb-2">
    <input
      v-model="query"
      placeholder="Start typing your address or postcode"
      autocomplete="off"
      class="form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-green focus:outline-none"
      @input="onInput"
      @keydown.down.prevent="move(1)"
      @keydown.up.prevent="move(-1)"
      @keydown.enter.prevent="choose(active)"
      @blur="closeSoon"
    />
    <ul
      v-if="suggestions.length"
      class="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow max-h-60 overflow-y-auto"
    >
      <li
        v-for="(suggestion, i) in suggestions"
        :key="i"
        class="px-3 py-2 text-sm cursor-pointer"
        :class="i === active ? 'bg-gray-100' : ''"
        @mousedown.prevent="choose(i)"
      >
        {{ suggestion.text }}
      </li>
    </ul>
    <p v-if="loading" class="text-xs text-gray-500 mt-1">Searching…</p>
  </div>
</template>

<script>
// Address lookup with Google Places (new API). Emits "select" with the address
// parts, or "unavailable" when Google can't be used, so the form shows the manual fields.
import Api from "../services/api";
import countries from "../data/countries.json";

let googleReady = null;

function loadGoogle(key) {
  if (googleReady) return googleReady;
  googleReady = new Promise((resolve, reject) => {
    const callback = "__zufPlacesLoaded";
    window[callback] = () => resolve(window.google);
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&libraries=places&loading=async&callback=${callback}`;
    script.async = true;
    script.onerror = reject;
    document.head.appendChild(script);
    setTimeout(() => reject(new Error("Google took too long to load")), 8000);
  });
  return googleReady;
}

function part(components, type, short = false) {
  const found = components.find((c) => (c.types || []).includes(type));
  if (!found) return "";
  return short ? found.shortText || found.longText || "" : found.longText || found.shortText || "";
}

export default {
  emits: ["select", "unavailable"],
  data() {
    return {
      query: "",
      suggestions: [],
      active: 0,
      loading: false,
      places: null,
      sessionToken: null,
      timer: null,
    };
  },
  async mounted() {
    try {
      const { data } = await Api.fetchSettings();
      if (!data.google_places_key) throw new Error("No address lookup key");
      const google = await loadGoogle(data.google_places_key);
      this.places = await google.maps.importLibrary("places");
      this.sessionToken = new this.places.AutocompleteSessionToken();
    } catch (e) {
      this.$emit("unavailable");
    }
  },
  methods: {
    onInput() {
      clearTimeout(this.timer);
      if (!this.places || this.query.trim().length < 3) {
        this.suggestions = [];
        return;
      }
      this.timer = setTimeout(this.search, 250);
    },
    async search() {
      this.loading = true;
      try {
        const { suggestions } = await this.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: this.query,
          sessionToken: this.sessionToken,
          // rank UK addresses first, other countries still allowed
          region: "gb",
        });
        this.suggestions = suggestions
          .filter((s) => s.placePrediction)
          .map((s) => ({ text: s.placePrediction.text.toString(), prediction: s.placePrediction }));
        this.active = 0;
      } catch (e) {
        this.suggestions = [];
        this.$emit("unavailable");
      } finally {
        this.loading = false;
      }
    },
    move(step) {
      if (!this.suggestions.length) return;
      this.active = (this.active + step + this.suggestions.length) % this.suggestions.length;
    },
    async choose(index) {
      const suggestion = this.suggestions[index];
      if (!suggestion) return;
      this.suggestions = [];
      this.query = suggestion.text;
      try {
        const place = suggestion.prediction.toPlace();
        await place.fetchFields({ fields: ["addressComponents"] });
        const c = place.addressComponents || [];
        const street = [part(c, "street_number"), part(c, "route")].filter(Boolean).join(" ");
        const building = [part(c, "subpremise"), part(c, "premise")].filter(Boolean).join(", ");
        const countryCode = part(c, "country", true);
        const country = countries.find((x) => x.code === countryCode);
        this.$emit("select", {
          address_line_1: [building, street].filter(Boolean).join(", "),
          address_line_2: part(c, "sublocality") || part(c, "neighborhood"),
          city: part(c, "postal_town") || part(c, "locality") || part(c, "administrative_area_level_2"),
          post_code: part(c, "postal_code"),
          country: country ? country.name : part(c, "country"),
        });
      } catch (e) {
        this.$emit("unavailable");
      }
      // a new session for the next search (Google bills per session)
      this.sessionToken = new this.places.AutocompleteSessionToken();
    },
    closeSoon() {
      setTimeout(() => (this.suggestions = []), 150);
    },
  },
};
</script>

<style>
 header {
   font-weight: bolder;
 }
</style>

<svelte:head>
  <title>CodeGradX/{shortTitle}</title>
</svelte:head>

<Header />

<section class='w3-container w3-margin-top w3-padding'>
  <header class='w3-center w3-large w3-margin-bottom'>
    {title}
  </header>

  <slot>
    <p> Page en construction... </p>
  </slot>
</section>

<Bottom />

<script>
 import Header from '../components/Header.svelte';
 import Bottom from '../components/Bottom.svelte';

 import { onMount } from 'svelte';
 import { person, campaign } from '../stores.mjs';
 import { initializePerson } from '../client/lib.mjs';

 export let title;
 export let shortTitle;
 
 onMount(async () => {
   if ( ! $person ) {
     $person = await initializePerson();
   }
 });

</script>

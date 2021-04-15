<!-- spinning logo -->

<div class='w3-center'>
  <!-- ParacamplusLogo /-->
  <Picture image='/fw4ex-512x512' alt='logo' height={height} />
</div>

<style>
 div {
   animation: rotation 9s infinite linear;
   margin: auto;
   z-index: 99;
   height: 50px;
 }
 @keyframes rotation {
   from { transform: rotate(0deg); }
   to {   transform: rotate(359deg); }
 }
 @keyframes fade-in {
   0% { opacity: 0; }
   100% { opacity: 1; }
 }
</style>

<script>
  import Picture from './Picture.svelte';
 //import ParacamplusLogo from './ParacamplusLogo.svelte';

 export let height = '50px';
</script>

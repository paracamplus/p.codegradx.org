<style>
 footer {
   max-height: 2rem;
   max-width: 100vw;
   display: flex;
   justify-content: space-between;
 }
 a {
   text-decoration : none;
   color: white;
 }
 div.hidden {
   color: var(--color-theme-d2);
 }
 div.hidden :hover {
   color: white !important;
 }
</style>

<footer id='Footer' class="w3-small w3-theme-d2">
  <div class="w3-container">
    <a href='https://codegradx.org/spip.php?article22'
       target='_blank' rel="noopener"
       title="Mentions légales">Mentions légales</a>
  </div>
  <div class="w3-container hidden">
    Version <code>{version}</code>
  </div>
  <div class="w3-container">
    <div class='w3-right'>
      <span class='w3-hide-small'>Une technologie de</span>
      <a href="https://paracamplus.com/" 
         target='_blank' rel="noopener"
         title="En savoir plus sur la SARL Paracamplus!">Paracamplus
        <ParacamplusLogo size='1em' /></a>
    </div>
  </div>
</footer>

<script>
 import ParacamplusLogo from '../components/ParacamplusLogo.svelte';
 import { version } from '../client/TS.mjs';
</script>

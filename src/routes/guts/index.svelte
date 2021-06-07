<Page shortTitle='Guts'
      title='Guts'>
  <div class='w3-container w3-center'>
    <div>
      <a class='w3-btn w3-round-xxlarge w3-theme-l4'
         href={buildGoto('/guts/cache')}> cache </a>
      <a class='w3-btn w3-round-xxlarge w3-theme-l4'
         href={buildGoto('/guts/store')}> store </a>
      <a class='w3-btn w3-round-xxlarge w3-theme-l4'
         href={buildGoto('/guts/cxcache')}> cxcache </a>
    </div>
  </div>
</Page>

<script>
 import Page from '../../components/Page.svelte';
 
 import { buildGoto } from '../../client/lib.mjs';
</script>

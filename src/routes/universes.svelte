<!--
    Display the possible universes (the open ones and the personal ones)
-->

<style>
 li span.va {
   width: 80vw;
 }
 li span.vaWithImage {
   vertical-align: 50px;
   width: 80vw;
 }
 .videoWrapper {
   height: 100px;
 }
 .videoWrapper iframe {
   top: 0;
   left: 0;
   width: 20%;
   height: auto !important;
 }
</style>

<Page shortTitle="Univers"
      title="Univers de programmation" >

  <LastMessage />

<section class='w3-container'>
 <div class='w3-padding'>
   {#if $person}
    <p>Bonjour <span class='personName'>{$person.pseudo}</span>,
      sélectionnez l'univers d'exercices de programmation que vous
      souhaitez explorer.
    </p>
   {:else}
    <p> Sélectionnez, après vous être identifié, l'univers d'exercices
        de programmation que vous souhaitez explorer. <br />
   {/if}

  {#if showauthentication}
  <div class='w3-container'>
    <div class='w3-center w3-animate-zoom'>
      <a class='w3-btn w3-center w3-round-xlarge w3-theme-d4'
         href={buildGoto('/connect')} >
        Je m'identifie...
      </a>
    </div>
  </div>
  {/if}

  <section>
    <header> Les univers ouverts à tous: </header>
    <p class='smallHint'>
     Le titre indique s'il est en anglais ou en français.
    </p>
    <ul class='w3-ul'>
      
      <li lang='fr'>
        <span class='vaWithImage'>
          <a href={buildGoto('/universe/scm')}
             title="Les exercices en Scheme"
             class='w3-btn w3-round-xlarge w3-theme-l4' >Scheme</a> 
          exercices issus du <a href='https://programmation-recursive.net/'
                                title="Voir le MOOC Programmation récursive"
                                class='w3-btn w3-round-xlarge w3-theme-l4' >
            MOOC « Programmation récursive »</a>
        </span>
        <span on:click={() => {showmoocprogrec = ! showmoocprogrec}}
          class='videoWrapper'>
          {#if showmoocprogrec}
          <iframe width='560' height='315'
                  title="Bande annonce du MOOC programmation récursive"
                  src="https://www.youtube.com/embed/nu9_3ZZ1k2M"
                  frameborder='0'
                  allowfullscreen ></iframe>
          {:else}
          <Picture image='/moocprogrec'
                   alt='Video du MOOC Programmation récursive' />
          {/if}
        </span>
      </li>
      
      <li lang='fr'>
        <span class='va'>
          <a href={buildGoto("universe/unx")}
             title="Les exercices autour des utilitaires d'Un*x"
             class='w3-btn w3-round-xlarge w3-theme-l4' > 
            <code>shell</code>
          </a> et autres utilitaires Unix (sed, tr, head, tail, cut,
          grep, sh, etc.)</span></li>
      
      <li lang='en'>
        <span class='vaWithImage'><em>
          <a href={buildGoto("universe/js")}
             title="Exercises in JavaScript"
             class='w3-btn w3-round-xlarge w3-theme-l4' >
            Javascript </a>
          exercises from the 
          <a href='https://paracamplus.gitlab.io/diffusejavascript/'
             title="Go to the Diffuse JavaScript MOOC"
             class='w3-btn w3-round-large w3-theme-l4'>
            MOOC « Diffuse JavaScript »</a></em>
        </span>
        <span on:click={() => {showmoocjs = ! showmoocjs}}
          class='videoWrapper'>
          {#if showmoocjs}
          <iframe width='560' height='315'
                  title="Teaser for the Diffuse JavaScript MOOC"
                  src="https://www.youtube.com/embed/6Ka2NoPcWck" 
                  frameborder='0'
                  allowfullscreen ></iframe>
          {:else}
          <Picture image='/moocjs' 
                   alt='Video of the MOOC Diffuse JavaScript' />
          {/if}
        </span>
      </li>
      
      <li lang='fr'>
        <span class='va'>
          <a href={buildGoto("universe/cc")}
             class='w3-btn w3-round-xlarge w3-theme-l4' >
            C
          </a> exercices du <a href="https://www.fun-mooc.fr/courses/course-v1:itii+119003+session03/about" class='w3-btn w3-round-large w3-theme-l4'>
            MOOC Socle informatique du CNAM </a>
        </span></li>
    
      <li lang='fr'>
        <span class='va'>
          <a href={buildGoto("universe/python")}
             title="Exercices en Python"
             class='w3-btn w3-round-xlarge w3-theme-l4' >
            Python
          </a> exercices en Python du cours IN101 :
          Algorithmique et programmation
          de l'ENSTA ParisTech</span></li>
      
      <li lang='fr'>
        <span class='va'>
          <a href={buildGoto("universe/jfp")}
             title="Les épreuves des JFP"
             class='w3-btn w3-round-xlarge w3-theme-l4' >
            Journées Franciliennes de Programmation
          </a> (langage libre)</span></li>
    </ul>
  </section>
      
  {#if $person && $person.campaigns.length > 0 }
  <section>
    <header> Vos univers personnels: </header>
    <p> Vous êtes aussi inscrit dans les univers suivants:</p>
    <Universes campaigns={$person.campaigns} />
  </section>
  {/if}
 
  </div>
</section>

</Page>

<script>
 import Page from '../components/Page.svelte';
 import Picture from '../components/Picture.svelte';
 import LastMessage from '../components/LastMessage.svelte';
 import Universes from '../components/Universes.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person, campaign } from '../stores.mjs';
 import { CodeGradX } from 'codegradx';
 import { initializePerson, buildGoto } from '../client/lib.mjs';

 let showmoocjs = false;
 let showmoocprogrec = false;
 let showauthentication = false;
 
 onMount(async () => {
   $person = await initializePerson();
   if ( ! $person ) {
     showauthentication = true;
   }
   $campaign = undefined;
 });

</script>

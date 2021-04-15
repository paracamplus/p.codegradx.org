<!--
      display an ExerciseReport for its author
-->

<style>
 tr.problematic {
   background-color: pink;
 }
 div.report {
   max-width: 100vw;
   background-color: var(--color-hover-gray);
   padding: 0.5em;
 }
</style>

<Page title={`Exercice ${exerciseTitle}`}
      shortTitle={`Exercice ${exerciseTitle}`}
      showheader={false} >

   <header class='w3-center w3-large bold'>
     Exercice {exerciseTitle}
     {#if showexercise}
     <span class='w3-right w3-margin-left w3-xlarge'
           title={"Information sur l'exercice"}
           on:click='{() => showinfo = true}'><InformationSign /></span>
     {/if}
   </header>

  {#if showexercise}
  <p class='smallHint'>
    Voici le rapport de déploiement de l'exercice.
    {#if exercise.safecookie} L'exercice a été déployé avec succès,
      cliquer sur le bouton ci-dessous permet d'accéder à l'énoncé.
    {/if}
    Les copies problématiques apparaissent avec un fond rose. Cliquer
    sur le mot "Pb" affiche le rapport d'anomalie (le stderr de la
    notation). C'est un rapport brut destiné à l'auteur de l'exercice.
    Cliquer sur la ligne affiche le rapport de notation de la pseudo-copie,
    cliquer+CTRL l'affiche dans un onglet différent.
  </p>

   {#if showinfo}
   <ExerciseInfo bind:exercise={exercise}
                 bind:showinfo={showinfo} />
   {/if}

   {#if exercise.safecookie}
      <div class='w3-center'>
        <a class='w3-button w3-round-xxlarge w3-theme-l4'
           title="exercise déployé"
           href={buildGoto(`/exercise/${exercise.safecookie}`)}
           >exercice {exercise.nickname}</a></div>
   {/if}

   {#if exercise.globalReport._cdata}
    <div class='report'>{@html massagePRE(exercise.globalReport._cdata)}</div>
   {/if}

   {#if exercise._pseudojobs.length > 0 }
    <table class='w3-table w3-center w3-hoverable w3-bordered w3-margin-top'>
      <thead>
        <tr class="w3-theme-l3">
          <th title="nom de la pseudo-copie">label</th>
          <th>note attendue</th>
          <th>note obtenue</th>
          <th>problème</th>
          <th title="durée de notation (en secondes)">durée</th>
        </tr>
      </thead>
      <tbody>
        {#each exercise._pseudojobs as job}
        <tr data-pathdir={job.pathdir}
            data-jobid={job.jobid}
            class:problematic={!!job.problem}
            on:click={mkShowJob(job)} >
          <td>{job.label}</td>
          <td>{job.expectedMark} / {job.totalMark}</td>
          <td>{job.mark} / {job.totalMark}</td>
          <td on:click={mkShowJobProblem(job)}>
            {#if job.problem}
              <span title="Afficher les problèmes">Pb</span>
            {/if}</td>
          <td>{job.duration}s</td>
        </tr>
        {/each}
      </tbody>
    </table>
   {/if}

  {:else if ! error}
     <p class='waitingMessage'> Recherche du rapport d'analyse...</p>
     <WaitingImage />
  {/if}

  {#if currentJob}
  <section class='w3-container w3-center w3-modal'
           style='display:block' >
    <div class='w3-modal-content w3-animate-top w3-border'>
      <JobReport bind:job={currentJob} attempts={2} />
    </div>
  </section>
  {/if}

  {#if currentJobProblem}
  <section class='w3-container w3-center w3-modal'
           style='display:block' >
    <div class='w3-modal-content w3-animate-top w3-border'>
      <JobProblemReport bind:job={currentJobProblem} />
    </div>
  </section>
  {/if}

  {#if error}<Problem bind:error={error} />{/if}
  
</Page>

<script>
 import Page from '../../components/Page.svelte';
 import Problem from '../../components/Problem.svelte';
 import WaitingImage from '../../components/WaitingImage.svelte';
 import ExerciseInfo from '../../components/ExerciseInfo.svelte';
 import InformationSign from '../../components/InformationSign.svelte';
 import JobReport from '../../components/JobReport.svelte';
 import JobProblemReport from '../../components/JobProblemReport.svelte';

 import * as sapper from '@sapper/app';
 import { onMount } from 'svelte';
 import { person } from '../../stores.mjs';
 import { initializePerson } from '../../client/lib.mjs';
 import { htmlencode } from 'codegradx/src/htmlencode';
 import { CodeGradX } from 'codegradx/exercise';
 import queryString from 'query-string';
 import { massagePRE } from '../../client/utils.mjs';
 import { buildGoto } from '../../client/lib.mjs';

 let newexercise = false;
 let ownurl = undefined;
 let error = undefined;
 let exercise = undefined;
 let showexercise = false;
 let exerciseTitle = '...';
 let showinfo = false;
 let currentJob = undefined;
 let currentJobProblem = undefined;

 onMount(async () => {
   const uri = window.document.location.pathname;
   const exerciseid = uri.replace(/^(.*\/)?myexercise\/([^\/]+)/, '$2');
   const location = '/e' + exerciseid.replace(/-/g, '').replace(/(.)/g, '/$1');
   exerciseTitle = exerciseid;
   if ( ! $person ) {
     $person = await initializePerson();
   }
   if ( ! $person ) {
     error = "Désolé, je ne vous connais pas!";
     return;
   } else if ( ! $person.isauthor ) {
     error = "Navré mais vous n'êtes pas auteur d'exercices!";
     return;
   }
   exercise = new CodeGradX.Exercise({ uuid: exerciseid, location });
   const search = queryString.parse(window.document.location.search);
   let parms = {};
   ownurl = `${uri}${window.document.location.search}`;
   if ( ! search.newexercise ) {
     parms = { step: 3, attempts: 2 };
   }
   try {
     await exercise.getExerciseReport(parms);
     if ( exercise.nickname ) {
       exerciseTitle = exercise.nickname;
     }
     showexercise = true;
     //console.log(exercise);
     if ( ! exercise.safecookie ) {
       error = "Exercice non déployé!";
     }
   } catch (exc) {
     error = `Je n'arrive pas à trouver le rapport de déploiement!
Veuillez bientôt recharger cette page...`; //'
   }
 });
 
 function mkShowJob (job) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     if ( event.metaKey || event.ctrlKey || event.altKey ) {
       const href = `/job/${job.jobid}`;
        const element = document.createElement('a');
        element.setAttribute('href', href);
        element.setAttribute('target', '_blank');
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
     } else {
       currentJob = job;
     }
   };
 }

 function mkShowJobProblem (job) {
   return function (event) {
     event.stopPropagation();
     event.preventDefault();
     if ( job.problem ) {
       currentJobProblem = job;
     }
   };
 }

  /*
<?xml version="1.0" encoding="UTF-8"?>
  <fw4ex version="1.0">
    <exerciseAuthorReport exerciseid="C91FAB30-7FEC-11EB-A621-B041CBDE09C8">
      <report><![CDATA[

[[[[[[[[[[[[[[ XML problems in fw4ex.xml ]]]]]]]]]]]]]]

FW4EX e212 Missing fw4ex.xml
]]></report></exerciseAuthorReport></fw4ex>


<?xml version="1.0" encoding="UTF-8"?>
<fw4ex version="1.0"><exerciseAuthorReport exerciseid="4B168C98-6566-11E8-88AE-F639DBB6D1F5" safecookie="UcD43ZAWlKSDA3JtSwO2nUIFLfzxqqrmYX6K9-iCI5TmHmT6_5X_fOQ2FQlYWtKg_WeUWsnG0Uyih6T10jetb7zE85l9Eq3U8_8P0E-gHbnvuC6Pb_wkdi_kx9Iw-byQpC35OSw1t1KklcYvYjF7tO2oK_XXtHkKBTigTxWIdToW1LbtfNTkeskj3fCzvxRUZnk-3E2GKgad2QkFAKgB7QogS9XmZlU91yDM5Vyq38qLVcO8tnXx4cFu_28JUorovdWcUkCfs2nxcMOiYGqrvnASE6Lr8Ita2JCJS21b95_wtUhpoyx64ZubVM9XuEluojPihynCGMxowQeD5WqOqzA@@"><identification name="com.paracamplus.fw4ex.versions" nickname="compiler-versions" date="2018-05-31T09:34:00Z">
      <summary> Afficher les versions des langages disponibles </summary>
      <tags>
        <tag name="Paracamplus"/>
        <tag name="test"/>
        <tag name="intern"/>
      </tags>
      <authorship>
        <author>
          <firstname>Christian</firstname>
          <lastname>Queinnec</lastname>
          <email>christian.queinnec@paracamplus.com</email>
        </author>
      </authorship>
    </identification><pseudojobs totaljobs="2" finishedjobs="2"><!--

--><pseudojob jobid="4CCD37EE-6566-11E8-AABE-ACEE71747CB5" location="/s/4/C/C/D/3/7/E/E/6/5/6/6/1/1/E/8/A/A/B/E/A/C/E/E/7/1/7/4/7/C/B/5" duration="1"><submission name="null" expectedMark="1">
        <content directory="pseudos/null"/>
      </submission><marking archived="2018-06-01T06:37:48" started="2018-06-01T06:37:52Z" ended="2018-06-01T06:37:52Z" finished="2018-06-01T06:37:52" mark="1" totalMark="1"><machine nickname="default" version="1"/><exercise exerciseid="4B168C98656611E888AEF639DBB6D1F5"/><partialMark name="Q1" mark="1"/></marking></pseudojob><!--

--><pseudojob jobid="4FECCFD4-6566-11E8-AABE-ACEE71747CB5" location="/s/4/F/E/C/C/F/D/4/6/5/6/6/1/1/E/8/A/A/B/E/A/C/E/E/7/1/7/4/7/C/B/5" duration="1"><submission name="perfect" expectedMark="1">
        <content directory="pseudos/perfect"/>
      </submission><marking archived="2018-06-01T06:37:53" started="2018-06-01T06:37:56Z" ended="2018-06-01T06:37:56Z" finished="2018-06-01T06:37:56" mark="1" totalMark="1"><exercise exerciseid="4B168C98656611E888AEF639DBB6D1F5"/><partialMark name="Q1" mark="1"/></marking></pseudojob></pseudojobs><report/></exerciseAuthorReport></fw4ex>

  */

</script>


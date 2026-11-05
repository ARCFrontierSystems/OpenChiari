# Spanish translation: review sheet

For the medical translator. **Status: pending review.** The Spanish site is public with a notice on every page saying
so (Matthew's decision, 2026-11-05); the English is the reference.

How the Spanish was made and checked:
1. Terms from the word list, `docs/SPANISH-GLOSSARY.md` (official MedlinePlus en español pages where possible).
2. Translated from the approved English (`src/i18n/en.json`, word for word from `docs/COPY.md`), using the earlier
   Spanish Home text in COPY.md where the English hadn't changed.
3. Independent agents translated the Spanish back into English **without seeing the English**, then compared the two
   (`docs/audits/2026-11-05-spanish-backtranslation.md`, then again after the check-up wording changes:
   `docs/audits/2026-11-05-spanish-backtranslation-2.md`). The column shows the latest blind back-translation; a row
   whose Spanish changed after it is marked so.

Known deliberate differences: the Explain It starter note says the same thing in fewer words, to fit the 280-character
limit; "(en inglés)" is added where content stays in English (official study listings, the downloadable figure set);
Support adds "Sus sitios web pueden estar solo en inglés."

Please check the **medical sentences** first (199 rows), then the rest (569 rows).
Made by `scripts/make-spanish-review.mjs`; rebuild it after any text change.

## Medical sentences

| Key | English (approved) | Spanish (on the site) | Blind back-translation |
| --- | --- | --- | --- |
| `metaDescription` | In Chiari malformation, the lowest part of the cerebellum sits below the opening where the brain meets the spinal cord. Explore it in 3D, free. | En la malformación de Chiari, la parte más baja del cerebelo queda por debajo de la abertura donde el cerebro se une con la médula espinal. Explórela en 3D, gratis. | In Chiari malformation, the lowest part of the cerebellum sits below the opening where the brain joins the spinal cord. Explore it in 3D, free. |
| `calm.lede` | In Chiari malformation, the lowest part of the cerebellum sits below the opening where the brain meets the spinal cord. | En la malformación de Chiari, la parte más baja del cerebelo queda por debajo de la abertura donde el cerebro se une con la médula espinal. | In Chiari malformation, the lowest part of the cerebellum sits below the opening where the brain joins the spinal cord. |
| `calm.figCaption` | Still image. Chiari I: the tonsil extends below the dashed line. Tonsils shown at their lowest point, where MRI measures them. Illustration, not a medical image. | Imagen fija. Chiari I: la amígdala cerebelosa se extiende por debajo de la línea punteada. Las amígdalas cerebelosas se muestran en su punto más bajo, donde se miden en la resonancia magnética. Ilustración, no es una imagen médica. | Still image. Chiari I: the cerebellar tonsil extends below the dotted line. The cerebellar tonsils are shown at their lowest point, where they are measured on MRI. Illustration, not a medical image. |
| `home.lede.wide` | In Chiari malformation, the lowest part of the cerebellum sits below the opening where the brain meets the spinal cord. Explore it in 3D, free, in plain language. | En la malformación de Chiari, la parte más baja del cerebelo queda por debajo de la abertura donde el cerebro se une con la médula espinal. Explórela en 3D, gratis y en lenguaje sencillo. | In Chiari malformation, the lowest part of the cerebellum sits below the opening where the brain joins the spinal cord. Explore it in 3D, free and in plain language. |
| `home.lede.narrow` | In Chiari malformation, the lowest part of the cerebellum sits below the opening where the brain meets the spinal cord. Explore it in 3D, free. | En la malformación de Chiari, la parte más baja del cerebelo queda por debajo de la abertura donde el cerebro se une con la médula espinal. Explórela en 3D, gratis. | In Chiari malformation, the lowest part of the cerebellum sits below the opening where the brain joins the spinal cord. Explore it in 3D, free. |
| `home.figCaption.wide` | Midline view of Chiari I. The tonsil (06) extends below the dashed line across the skull opening. The tonsils really sit just to either side of the midline; they're shown here where MRI measures them, at their lowest point. Illustration, not a medical image. | Vista de la línea media en Chiari I. La amígdala cerebelosa (06) se extiende por debajo de la línea punteada que cruza la abertura del cráneo. En realidad, las amígdalas cerebelosas están justo a cada lado de la línea media; aquí se muestran donde se miden en la resonancia magnética, en su punto más bajo. Ilustración, no es una imagen médica. | Midline view in Chiari I. The cerebellar tonsil (06) extends below the dotted line that crosses the skull opening. In reality, the cerebellar tonsils are just to each side of the midline; here they are shown where they are measured on MRI, at their lowest point. Illustration, not a medical image. |
| `home.figCaption.narrow` | Chiari I. The tonsil extends below the dashed line. Tonsils shown at their lowest point, where MRI measures them. Illustration, not a medical image. | Chiari I. La amígdala cerebelosa se extiende por debajo de la línea punteada. Las amígdalas cerebelosas se muestran en su punto más bajo, donde se miden en la resonancia magnética. Ilustración, no es una imagen médica. | Chiari I. The cerebellar tonsil extends below the dotted line. The cerebellar tonsils are shown at their lowest point, where they are measured on MRI. Illustration, not a medical image. |
| `home.whatIs.title` | What is Chiari malformation? | ¿Qué es la malformación de Chiari? | What is Chiari malformation? |
| `home.whatIs.whatItIs.title` | What it is | Qué es | What it is |
| `home.whatIs.whatItIs.wide` | The lowest part of the cerebellum, the tonsils, extends below the foramen magnum, the opening at the base of the skull. The cerebellum helps control balance and coordination. It's often linked to a lower back part of the skull that is smaller or shaped differently than usual, which crowds the brain. Less often, it develops later in life for other reasons. | Las amígdalas cerebelosas, la parte más baja del cerebelo, se extienden por debajo del agujero magno, la abertura en la base del cráneo. El cerebelo ayuda a controlar el equilibrio y la coordinación. A menudo, la malformación está relacionada con que la parte posterior e inferior del cráneo sea más pequeña de lo habitual o tenga otra forma, lo que deja poco espacio al cerebro. Con menos frecuencia, aparece más adelante en la vida por otras causas. | The cerebellar tonsils, the lowest part of the cerebellum, extend below the foramen magnum, the opening at the base of the skull. The cerebellum helps control balance and coordination. Often, the malformation is related to the back and lower part of the skull being smaller or having another shape, which leaves little room for the brain. Less often, it appears later in life from other causes. **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.whatIs.whatItIs.narrow` | The lowest part of the cerebellum, the tonsils, extends below the opening at the base of the skull. It's often linked to a lower back part of the skull that is smaller or shaped differently than usual, which crowds the brain. Less often, it develops later in life for other reasons. | Las amígdalas cerebelosas, la parte más baja del cerebelo, se extienden por debajo de la abertura en la base del cráneo. A menudo, la malformación está relacionada con que la parte posterior e inferior del cráneo sea más pequeña de lo habitual o tenga otra forma, lo que deja poco espacio al cerebro. Con menos frecuencia, aparece más adelante en la vida por otras causas. | The cerebellar tonsils, the lowest part of the cerebellum, extend below the opening at the base of the skull. Often, the malformation is related to the back and lower part of the skull being smaller or having another shape, which leaves little room for the brain. Less often, it appears later in life from other causes. **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.whatIs.whoHasIt.title` | Who has it | Quién la tiene | Who has it |
| `home.whatIs.whoHasIt.wide` | Most people are born with the skull differences that lead to it. Some never have symptoms; others first notice them as teens or adults. | La mayoría de las personas nacen con las diferencias del cráneo que la causan. Algunas nunca tienen síntomas; otras los notan por primera vez en la adolescencia o en la edad adulta. | Most people are born with the skull differences that cause it. Some never have symptoms; others notice them for the first time in adolescence or in adulthood. |
| `home.whatIs.whoHasIt.narrow` | Most people are born with the skull differences that lead to it. Some never have symptoms; others first notice them as teens or adults. | La mayoría de las personas nacen con las diferencias del cráneo que la causan. Algunas nunca tienen síntomas; otras los notan por primera vez en la adolescencia o en la edad adulta. | Most people are born with the skull differences that cause it. Some never have symptoms; others notice them for the first time in adolescence or in adulthood. |
| `home.whatIs.howFound.title` | How it's found | Cómo se detecta | How it is detected |
| `home.whatIs.howFound.wide` | Usually with an MRI scan and a doctor's exam, sometimes by chance during a scan for something else. A doctor looks at the scan together with your symptoms. | Por lo general, con una resonancia magnética y un examen médico; a veces, por casualidad, durante un estudio por otro motivo. El médico revisa las imágenes junto con los síntomas que usted tiene. | Usually, with an MRI and a medical exam; sometimes, by chance, during a scan for another reason. The doctor reviews the images together with your symptoms. **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.whatIs.howFound.narrow` | Usually with an MRI scan and a doctor's exam, sometimes by chance. | Por lo general, con una resonancia magnética y un examen médico; a veces, por casualidad. | Usually, with an MRI and a medical exam; sometimes, by chance. |
| `home.feel.title` | What it can feel like | Qué se puede sentir | What can be felt |
| `home.feel.intro` | Chiari looks different for everyone, and many people with Type I have no symptoms at all. | Chiari es diferente en cada persona, y muchas personas con el tipo I no tienen ningún síntoma. | Chiari is different in each person, and many people with type I do not have any symptoms. |
| `home.feel.classic.wide` | The classic sign is a headache at the back of the head that comes on after coughing, sneezing or straining. | El síntoma clásico es un dolor de cabeza en la parte de atrás de la cabeza que aparece después de toser, estornudar o hacer un esfuerzo. | The classic symptom is a headache in the back of the head that appears after coughing, sneezing or straining. |
| `home.feel.classic.narrow` | The classic sign is a headache at the back of the head after coughing, sneezing or straining. | El síntoma clásico es un dolor de cabeza en la parte de atrás de la cabeza después de toser, estornudar o hacer un esfuerzo. | The classic symptom is a headache in the back of the head after coughing, sneezing or straining. |
| `home.feel.listLabel` | Other symptoms people report | Otros síntomas que describen las personas | Other symptoms that people describe |
| `home.feel.symptoms.0.wide` | Neck pain | Dolor de cuello | Neck pain |
| `home.feel.symptoms.0.narrow` | Neck pain | Dolor de cuello | Neck pain |
| `home.feel.symptoms.1.wide` | Dizziness and trouble with balance | Mareos y problemas de equilibrio | Dizziness and balance problems |
| `home.feel.symptoms.1.narrow` | Dizziness and trouble with balance | Mareos y problemas de equilibrio | Dizziness and balance problems |
| `home.feel.symptoms.2.wide` | Numbness or tingling in the hands and feet | Entumecimiento u hormigueo en las manos y los pies | Numbness or tingling in the hands and feet |
| `home.feel.symptoms.2.narrow` | Numbness or tingling in hands and feet | Entumecimiento u hormigueo en manos y pies | Numbness or tingling in hands and feet |
| `home.feel.symptoms.3.wide` | Weakness or trouble with fine hand movements | Debilidad o dificultad para hacer movimientos finos con las manos | Weakness or difficulty making fine movements with the hands |
| `home.feel.symptoms.3.narrow` | Weakness or trouble with fine hand movements | Debilidad o dificultad para hacer movimientos finos con las manos | Weakness or difficulty making fine movements with the hands |
| `home.feel.symptoms.4.wide` | Trouble swallowing or speaking | Dificultad para tragar o para hablar | Difficulty swallowing or speaking |
| `home.feel.symptoms.4.narrow` | Trouble swallowing or speaking | Dificultad para tragar o para hablar | Difficulty swallowing or speaking |
| `home.feel.symptoms.5.wide` | Breathing or sleep problems, such as sleep apnea | Problemas para respirar o para dormir, como la apnea del sueño | Problems breathing or sleeping, such as sleep apnea |
| `home.feel.symptoms.5.narrow` | Breathing or sleep problems | Problemas para respirar o para dormir | Problems breathing or sleeping |
| `home.feel.symptoms.6.wide` | Ringing in the ears | Zumbido en los oídos | Ringing in the ears |
| `home.feel.symptoms.6.narrow` | Ringing in the ears | Zumbido en los oídos | Ringing in the ears |
| `home.feel.symptoms.7.wide` | Blurry or double vision | Visión borrosa o doble | Blurred or double vision |
| `home.feel.symptoms.7.narrow` | Blurry or double vision | Visión borrosa o doble | Blurred or double vision |
| `home.feel.symptoms.8.wide` | A curve in the spine (scoliosis), especially in children | Una curvatura de la columna (escoliosis), sobre todo en niños | A curvature of the spine (scoliosis), especially in children |
| `home.feel.symptoms.8.narrow` | A curve in the spine (scoliosis) | Una curvatura de la columna (escoliosis) | A curvature of the spine (scoliosis) |
| `home.feel.noSymptoms` | Many people with Type I have no symptoms at all. | Muchas personas con el tipo I no tienen ningún síntoma. | Many people with type I do not have any symptoms. |
| `home.myths.title` | Common misunderstandings | Ideas equivocadas comunes | Common mistaken ideas |
| `home.myths.items.0.myth` | "It's just a bad headache." | "Es solo un dolor de cabeza fuerte". | "It's just a strong headache." |
| `home.myths.items.0.wide` | Chiari is a structural difference that can affect balance, nerves and the flow of spinal fluid, not only headaches. | Chiari es una diferencia en la estructura que puede afectar el equilibrio, los nervios y el flujo del líquido cefalorraquídeo, no solo causar dolores de cabeza. | Chiari is a difference in structure that can affect balance, the nerves and the flow of cerebrospinal fluid, not just cause headaches. |
| `home.myths.items.0.narrow` | It can affect balance, nerves and the flow of spinal fluid too. | También puede afectar el equilibrio, los nervios y el flujo del líquido cefalorraquídeo. | It can also affect balance, the nerves and the flow of cerebrospinal fluid. |
| `home.myths.items.1.myth` | "The measurement tells the whole story." | "La medida lo dice todo". | "The measurement says it all." |
| `home.myths.items.1.wide` | Doctors traditionally use about 5 mm below the opening as a cutoff. How far the tonsils extend doesn't always match how someone feels. Some people with a clear descent have no symptoms, and some with less than 5 mm do. Doctors also look at the shape of the tonsils, spinal fluid flow, and whether a syrinx is present. | Tradicionalmente, los médicos usan como límite unos 5 mm por debajo de la abertura. Lo que bajan las amígdalas cerebelosas no siempre coincide con cómo se siente una persona. Algunas personas con un descenso claro no tienen síntomas, y algunas con menos de 5 mm sí los tienen. Los médicos también observan la forma de las amígdalas cerebelosas, el flujo del líquido cefalorraquídeo y si hay una siringe. | Traditionally, doctors use as a cutoff about 5 mm below the opening. How far the cerebellar tonsils go down does not always match how a person feels. Some people with a clear descent have no symptoms, and some with less than 5 mm do have them. Doctors also look at the shape of the cerebellar tonsils, the flow of cerebrospinal fluid and whether there is a syrinx. |
| `home.myths.items.1.narrow` | How far the tonsils extend doesn't always match how someone feels. Doctors also look at tonsil shape, fluid flow, and whether a syrinx is present. | Lo que bajan las amígdalas cerebelosas no siempre coincide con cómo se siente una persona. Los médicos también observan su forma, el flujo del líquido y si hay una siringe. | How far the cerebellar tonsils go down does not always match how a person feels. Doctors also look at their shape, the flow of the fluid and whether there is a syrinx. |
| `home.tools.items.0.wide` | Compare typical anatomy, Chiari, syrinx and after surgery. Peel back layers and cut through the model. | Compare la anatomía típica con Chiari, con siringe y después de la cirugía. Retire capas y corte el modelo. | Compare typical anatomy with Chiari, with syrinx and after surgery. Remove layers and cut the model. |
| `home.tools.items.0.narrow` | Compare typical, Chiari, syrinx and after surgery. | Compare la anatomía típica, Chiari, siringe y después de la cirugía. | Compare typical anatomy, Chiari, syrinx and after surgery. |
| `home.tools.items.1.wide` | Send family, teachers or your employer a link to the view that matches your diagnosis. | Envíe a su familia, a los maestros o a su empleador un enlace a la vista que corresponde a su diagnóstico. | Send your family, your teachers or your employer a link to the view that corresponds to your diagnosis. **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.tools.items.1.narrow` | Send a link to the view that matches your diagnosis. | Envíe un enlace a la vista que corresponde a su diagnóstico. | Send a link to the view that corresponds to your diagnosis. |
| `home.tools.items.2.wide` | Chiari and syringomyelia studies looking for participants, updated daily. | Estudios sobre Chiari y siringomielia que buscan participantes, actualizados a diario. | Studies on Chiari and syringomyelia that are looking for participants, updated daily. |
| `home.tools.items.2.narrow` | Studies looking for participants, updated daily. | Estudios que buscan participantes, actualizados a diario. | Studies looking for participants, updated daily. |
| `home.tools.items.3.wide` | Build a one-page list of questions for your next appointment. Nothing is saved. | Haga una lista de preguntas de una página para su próxima cita. No se guarda nada. | Make a one-page list of questions for your next appointment. Nothing is saved. |
| `home.tools.items.3.narrow` | A printable list of questions. Nothing saved. | Una lista de preguntas para imprimir. No se guarda nada. | A list of questions to print. Nothing is saved. |
| `home.tools.items.4.wide` | Free to download and embed for foundations, nurses and teachers. | Gratis para descargar e insertar en sitios web, para fundaciones, enfermeros y maestros. | Free to download and embed in websites, for foundations, nurses and teachers. |
| `home.tools.items.4.narrow` | Free to download and embed. | Gratis para descargar e insertar. | Free to download and embed. |
| `home.tools.items.5.wide` | Donate to or volunteer with the groups funding research and supporting families. | Done o sea voluntario en los grupos que financian la investigación y apoyan a las familias. | Donate or volunteer at the groups that fund research and support families. |
| `home.tools.items.5.narrow` | Donate or volunteer on their own sites. | Done o sea voluntario en sus propios sitios web. | Donate or volunteer on their own websites. |
| `footer.notAdvice` | Not medical advice. | No es consejo médico. | It is not medical advice. |
| `footer.notAdviceRest.wide` | Talk to your doctor about your own care. | Hable con su médico sobre su propia atención médica. | Talk with your doctor about your own medical care. |
| `footer.notAdviceRest.narrow` | Talk to your doctor about your own care. | Hable con su médico sobre su propia atención médica. | Talk with your doctor about your own medical care. |
| `figure.ariaPrefix` | Midline section of the head and neck,  | Corte de la línea media de la cabeza y el cuello,  | Midline cut of the head and neck,  |
| `figure.aria.typical` | typical anatomy: the cerebellar tonsils sit above the opening at the base of the skull | anatomía típica: las amígdalas cerebelosas están por encima de la abertura en la base del cráneo | typical anatomy: the cerebellar tonsils are above the opening at the base of the skull |
| `figure.aria.chiari` | Chiari I: the cerebellar tonsils extend below the opening at the base of the skull and often crowd the spinal fluid space | Chiari I: las amígdalas cerebelosas se extienden por debajo de la abertura en la base del cráneo y a menudo reducen el espacio del líquido cefalorraquídeo | Chiari I: the cerebellar tonsils extend below the opening at the base of the skull and often reduce the cerebrospinal fluid space |
| `figure.aria.syrinx` | Chiari I with a syrinx, a fluid-filled cavity inside the spinal cord | Chiari I con siringe, una cavidad llena de líquido dentro de la médula espinal | Chiari I with syrinx, a fluid-filled cavity inside the spinal cord |
| `figure.aria.surgery` | after decompression surgery: bone at the back of the skull opening and the back of the first vertebra are removed, opening the fluid space | después de la cirugía de descompresión: se retiró hueso de la parte de atrás de la abertura del cráneo y la parte de atrás de la primera vértebra, lo que abre el espacio del líquido | after decompression surgery: bone was removed from the back of the skull opening and the back of the first vertebra, which opens the fluid space |
| `figure.labels.cerebrum` | Cerebrum | Cerebro | Brain [Cerebro] |
| `figure.labels.callosum` | Corpus callosum | Cuerpo calloso | Corpus callosum |
| `figure.labels.cerebellum` | Cerebellum | Cerebelo | Cerebellum |
| `figure.labels.fourthVentricle` | Fourth ventricle | Cuarto ventrículo | Fourth ventricle |
| `figure.labels.brainstem` | Brainstem | Tronco encefálico | Brainstem |
| `figure.labels.tonsil` | Cerebellar tonsil | Amígdala cerebelosa | Cerebellar tonsil |
| `figure.labels.foramen` | Foramen magnum | Agujero magno | Foramen magnum |
| `figure.labels.foramenNote` | opening at the skull base | abertura en la base del cráneo | opening at the base of the skull |
| `figure.labels.foramenNoteSurgery` | dashed line: where its edges were | línea punteada: donde estaban sus bordes | dotted line: where its edges were |
| `figure.labels.cord` | Spinal cord | Médula espinal | Spinal cord |
| `figure.labels.csf` | Spinal fluid (CSF) | Líquido cefalorraquídeo (LCR) | Cerebrospinal fluid (CSF) |
| `figure.labels.c2` | C2 vertebra | Vértebra C2 | C2 vertebra |
| `figure.labels.syrinx` | Syrinx | Siringe | Syrinx |
| `figure.labels.syrinxNote` | fluid cavity in the cord | cavidad de líquido en la médula espinal | fluid cavity in the spinal cord |
| `figure.labels.boneRemoved` | Bone removed | Hueso retirado | Bone removed |
| `figure.labels.boneRemovedNote` | skull edge and C1 arch | borde del cráneo y arco de C1 | edge of the skull and arch of C1 |
| `explorer.conditions.typical.label` | Typical anatomy | Anatomía típica | Typical anatomy |
| `explorer.conditions.typical.note` | The tonsils usually sit at or above the dashed line across the skull opening (a few millimeters below can still be normal), and spinal fluid moves freely around them. | Las amígdalas cerebelosas suelen estar a la altura de la línea punteada que cruza la abertura del cráneo o por encima de ella (unos pocos milímetros por debajo todavía puede ser normal), y el líquido cefalorraquídeo circula libremente a su alrededor. | The cerebellar tonsils usually sit at the level of the dotted line that crosses the skull opening or above it (a few millimeters below can still be normal), and the cerebrospinal fluid flows freely around them. |
| `explorer.conditions.typical.noteShort` | Tonsils usually sit at or above the skull opening (a few millimeters below can be normal); fluid moves freely. | Las amígdalas cerebelosas suelen estar a la altura de la abertura del cráneo o por encima (unos pocos milímetros por debajo puede ser normal); el líquido circula libremente. | The cerebellar tonsils usually sit at the level of the skull opening or above (a few millimeters below can be normal); the fluid flows freely. |
| `explorer.conditions.chiari.label` | Chiari I | Chiari I | Chiari I |
| `explorer.conditions.chiari.note` | The tonsils extend below the opening, at least about 5 mm by the usual definition. In one study of 160 people with Chiari I, the average was about 12 mm, but it ranged from 5 to 25 mm, and the number alone doesn't decide who needs surgery. They are often pointed rather than rounded. The fluid space behind them is often crowded, and in many people fluid flow slows or is blocked there. | Las amígdalas cerebelosas se extienden por debajo de la abertura, al menos unos 5 mm según la definición habitual. En un estudio de 160 personas con Chiari I, el promedio fue de unos 12 mm, pero varió de 5 a 25 mm, y la cifra por sí sola no decide quién necesita cirugía. A menudo tienen forma puntiaguda en lugar de redondeada. El espacio del líquido detrás de ellas a menudo queda reducido, y en muchas personas el flujo del líquido se hace más lento o se bloquea ahí. | The cerebellar tonsils extend below the opening, at least about 5 mm by the usual definition. In a study of 160 people with Chiari I, the average was about 12 mm, but it ranged from 5 to 25 mm, and the number by itself does not decide who needs surgery. They often have a pointed shape instead of rounded. The fluid space behind them is often reduced, and in many people the flow of the fluid becomes slower or is blocked there. |
| `explorer.conditions.chiari.noteShort` | Tonsils extend below the opening and often crowd the fluid space; in many people flow slows there. | Las amígdalas cerebelosas se extienden por debajo de la abertura y a menudo reducen el espacio del líquido; en muchas personas el flujo se hace más lento ahí. | The cerebellar tonsils extend below the opening and often reduce the fluid space; in many people the flow becomes slower there. |
| `explorer.conditions.syrinx.label` | Chiari I with syrinx | Chiari I con siringe | Chiari I with syrinx |
| `explorer.conditions.syrinx.note` | A syrinx is a fluid-filled cavity inside the spinal cord. It often develops alongside Chiari, most often in the neck part of the spinal cord. | Una siringe es una cavidad llena de líquido dentro de la médula espinal. A menudo aparece junto con Chiari, sobre todo en la parte de la médula espinal que está en el cuello. | A syrinx is a fluid-filled cavity inside the spinal cord. It often appears together with Chiari, especially in the part of the spinal cord that is in the neck. |
| `explorer.conditions.syrinx.noteShort` | A fluid-filled cavity has formed inside the spinal cord. | Se formó una cavidad llena de líquido dentro de la médula espinal. | A fluid-filled cavity formed inside the spinal cord. |
| `explorer.conditions.surgery.label` | After decompression | Después de la descompresión | After decompression |
| `explorer.conditions.surgery.note` | Surgeons remove a small piece of bone at the back of the skull opening and often the back of the first vertebra. Often they also open and patch the brain's covering to make more room for spinal fluid. The tonsils often rise only partly. Surgery improves or stabilizes symptoms in most people, though damage that has already happened may not fully reverse, and some people need more than one operation. Results vary, and surgery isn't right for everyone. | Los cirujanos retiran un pequeño trozo de hueso de la parte de atrás de la abertura del cráneo y, a menudo, la parte de atrás de la primera vértebra. A menudo también abren la membrana que cubre el cerebro y le colocan un parche para dar más espacio al líquido cefalorraquídeo. Las amígdalas cerebelosas a menudo suben solo en parte. La cirugía mejora o estabiliza los síntomas en la mayoría de las personas, aunque el daño que ya ocurrió puede no revertirse por completo, y algunas personas necesitan más de una operación. Los resultados varían, y la cirugía no es adecuada para todos. | Surgeons remove a small piece of bone from the back of the skull opening and, often, the back of the first vertebra. Often they also open the membrane that covers the brain and put a patch on it to give more room to the cerebrospinal fluid. The cerebellar tonsils often rise only partly. Surgery improves or stabilizes symptoms in most people, although damage that already happened may not reverse completely, and some people need more than one operation. Results vary, and surgery is not right for everyone. |
| `explorer.conditions.surgery.noteShort` | Bone is removed at the back of the opening to make room. Most people improve or stabilize, but results vary, some need another operation, and surgery isn't right for everyone. | Se retira hueso de la parte de atrás de la abertura para dar espacio. La mayoría de las personas mejoran o se estabilizan, pero los resultados varían, algunas necesitan otra operación y la cirugía no es adecuada para todos. | Bone is removed from the back of the opening to give room. Most people improve or stabilize, but results vary, some need another operation and surgery is not right for everyone. |
| `explorer.captionIllustration` | Illustration, not a medical image | Ilustración, no es una imagen médica | Illustration, not a medical image |
| `explorer.captionFlow` | Fluid flow simplified | Flujo del líquido simplificado | Fluid flow simplified |
| `explorer.captionTonsils` | Tonsils shown at their lowest point, where MRI measures them | Las amígdalas cerebelosas se muestran en su punto más bajo, donde se miden en la resonancia magnética | The cerebellar tonsils are shown at their lowest point, where they are measured on MRI |
| `explorer.parts.0.name` | Cerebrum | Cerebro | Brain [Cerebro] |
| `explorer.parts.0.text` | The largest part of the brain, responsible for thinking, movement and the senses. | La parte más grande del encéfalo, encargada del pensamiento, el movimiento y los sentidos. | The largest part of the brain [encéfalo], in charge of thinking, movement and the senses. |
| `explorer.parts.1.name` | Corpus callosum | Cuerpo calloso | Corpus callosum |
| `explorer.parts.1.text` | A thick band of nerve fibers connecting the left and right halves of the brain. | Una banda gruesa de fibras nerviosas que une las mitades izquierda y derecha del cerebro. | A thick band of nerve fibers that joins the left and right halves of the brain. |
| `explorer.parts.2.name` | Cerebellum | Cerebelo | Cerebellum |
| `explorer.parts.2.text` | The back part of the brain that helps control balance and coordination. | La parte de atrás del encéfalo que ayuda a controlar el equilibrio y la coordinación. | The back part of the brain [encéfalo] that helps control balance and coordination. |
| `explorer.parts.3.name` | Fourth ventricle | Cuarto ventrículo | Fourth ventricle |
| `explorer.parts.3.text` | A small fluid-filled space between the brainstem and cerebellum, where spinal fluid passes through. | Un pequeño espacio lleno de líquido entre el tronco encefálico y el cerebelo, por donde pasa el líquido cefalorraquídeo. | A small fluid-filled space between the brainstem and the cerebellum, through which the cerebrospinal fluid passes. |
| `explorer.parts.4.name` | Brainstem | Tronco encefálico | Brainstem |
| `explorer.parts.4.text` | Connects the brain to the spinal cord and runs automatic functions like breathing, heart rate and swallowing. | Une el cerebro con la médula espinal y controla funciones automáticas como la respiración, el ritmo cardíaco y la deglución. | Joins the brain with the spinal cord and controls automatic functions such as breathing, heart rate and swallowing. |
| `explorer.parts.5.name` | Cerebellar tonsil | Amígdala cerebelosa | Cerebellar tonsil |
| `explorer.parts.5.text` | The two lowest parts of the cerebellum. In Chiari, they extend below the opening at the base of the skull and are often pointed (peg-shaped) rather than rounded. They really sit just to either side of the midline and often descend unevenly; the model shows them at their lowest point, where MRI measures them. | Las dos partes más bajas del cerebelo. En Chiari, se extienden por debajo de la abertura en la base del cráneo y a menudo tienen forma puntiaguda (de clavija) en lugar de redondeada. En realidad, están justo a cada lado de la línea media y a menudo bajan de forma desigual; el modelo las muestra en su punto más bajo, donde se miden en la resonancia magnética. | The two lowest parts of the cerebellum. In Chiari, they extend below the opening at the base of the skull and often have a pointed (peg-like) shape instead of rounded. In reality, they are just to each side of the midline and often go down unevenly; the model shows them at their lowest point, where they are measured on MRI. |
| `explorer.parts.6.name` | Foramen magnum | Agujero magno | Foramen magnum |
| `explorer.parts.6.text` | The opening at the base of the skull where the brainstem becomes the spinal cord. | La abertura en la base del cráneo donde el tronco encefálico se convierte en la médula espinal. | The opening at the base of the skull where the brainstem becomes the spinal cord. |
| `explorer.parts.7.name` | Spinal cord | Médula espinal | Spinal cord |
| `explorer.parts.7.text` | Carries signals between the brain and the rest of the body. | Lleva las señales entre el cerebro y el resto del cuerpo. | Carries signals between the brain and the rest of the body. |
| `explorer.parts.8.name` | Spinal fluid (CSF) | Líquido cefalorraquídeo (LCR) | Cerebrospinal fluid (CSF) |
| `explorer.parts.8.text` | Cerebrospinal fluid: clear fluid that cushions the brain and spinal cord. With each heartbeat it pulses back and forth between the skull and the spinal canal. | Un líquido transparente que amortigua el cerebro y la médula espinal. Con cada latido del corazón, se mueve de un lado a otro entre el cráneo y el canal espinal. | A clear fluid that cushions the brain and the spinal cord. With each heartbeat, it moves back and forth between the skull and the spinal canal. |
| `explorer.parts.9.name` | C2 vertebra | Vértebra C2 | C2 vertebra |
| `explorer.parts.9.text` | The second bone of the neck. Its upward peg, the dens, sits just in front of the spinal cord. | El segundo hueso del cuello. Su saliente hacia arriba, la apófisis odontoides, está justo delante de la médula espinal. | The second bone of the neck. Its upward projection, the odontoid process, is just in front of the spinal cord. |
| `explorer.parts.10.name` | Syrinx | Siringe | Syrinx |
| `explorer.parts.10.text` | A fluid-filled cavity inside the spinal cord. It often develops alongside Chiari, most often in the neck part of the spinal cord. | Una cavidad llena de líquido dentro de la médula espinal. A menudo aparece junto con Chiari, sobre todo en la parte de la médula espinal que está en el cuello. | A fluid-filled cavity inside the spinal cord. It often appears together with Chiari, especially in the part of the spinal cord that is in the neck. |
| `explorer.parts.11.name` | Bone removed | Hueso retirado | Bone removed |
| `explorer.parts.11.text` | Surgeons remove a small piece of bone at the back of the skull opening and often the back of the first vertebra. | Los cirujanos retiran un pequeño trozo de hueso de la parte de atrás de la abertura del cráneo y, a menudo, la parte de atrás de la primera vértebra. | Surgeons remove a small piece of bone from the back of the skull opening and, often, the back of the first vertebra. |
| `prep.groups.0.title` | About my diagnosis | Sobre mi diagnóstico | About my diagnosis |
| `prep.groups.0.questions.0.text` | Which type of Chiari do I have? | ¿Qué tipo de Chiari tengo? | What type of Chiari do I have? |
| `prep.groups.0.questions.1.text` | Can I have a copy of my MRI report and images? | ¿Me puede dar una copia del informe y las imágenes de mi resonancia magnética? | Can you give me a copy of the report and images of my MRI? |
| `prep.groups.0.questions.2.text` | Do I have a syrinx? | ¿Tengo una siringe? | Do I have a syrinx? |
| `prep.groups.1.title` | My symptoms | Mis síntomas | My symptoms |
| `prep.groups.1.questions.0.text` | Which of my symptoms do you think come from Chiari? | ¿Cuáles de mis síntomas cree usted que vienen de Chiari? | Which of my symptoms do you think come from Chiari? |
| `prep.groups.1.questions.0.narrow` | Which of my symptoms do you think come from Chiari? | ¿Cuáles de mis síntomas cree usted que vienen de Chiari? | Which of my symptoms do you think come from Chiari? |
| `prep.groups.1.questions.1.text` | What changes should make me call you or go to the ER? | ¿Qué cambios deberían hacer que lo llame o que vaya a la sala de emergencias? | What changes should make me call you or go to the emergency room? |
| `prep.groups.1.questions.1.narrow` | What should make me call you or go to the ER? | ¿Qué debería hacer que lo llame o que vaya a emergencias? | What should make me call you or go to the emergency room? |
| `prep.groups.2.title` | Tests and monitoring | Pruebas y seguimiento | Tests and follow-up |
| `prep.groups.2.questions.0.text` | Do I need a fluid-flow MRI (cine MRI) or other tests? | ¿Necesito una resonancia magnética de flujo (cine-RM) u otras pruebas? | Do I need a flow MRI (cine MRI) or other tests? |
| `prep.groups.2.questions.1.text` | Do I need follow-up scans, and if so, how often? | ¿Necesito estudios de control y, si es así, cada cuánto? | Do I need follow-up scans and, if so, how often? |
| `prep.groups.3.title` | Treatment | Tratamiento | Treatment |
| `prep.groups.3.questions.0.text` | What are my treatment options, including monitoring? | ¿Cuáles son mis opciones de tratamiento, incluida la vigilancia con controles periódicos? | What are my treatment options, including follow-up? **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.3.questions.1.text` | Am I a candidate for decompression surgery? Why or why not? | ¿La cirugía de descompresión es una opción para mí? ¿Por qué sí o por qué no? | Is decompression surgery an option for me? Why or why not? |
| `prep.groups.3.questions.2.text` | How many of these surgeries have you done, and what is recovery like? | ¿Cuántas de estas cirugías ha hecho usted y cómo es la recuperación? | How many of these surgeries have you done and what is recovery like? |
| `prep.groups.4.title` | Daily life and research | Vida diaria e investigación | Daily life and research |
| `prep.groups.4.questions.0.text` | Are there activities I should avoid? | ¿Hay actividades que debería evitar? | Are there activities I should avoid? |
| `prep.groups.4.questions.1.text` | Are there research studies I could join? | ¿Hay estudios de investigación en los que podría participar? | Are there research studies I could take part in? |
| `prep.groups.5.title` | Before surgery | Antes de la cirugía |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.5.questions.0.text` | Why do you recommend surgery, and what are the benefits and risks for me? | ¿Por qué me recomienda la cirugía, y cuáles son los beneficios y los riesgos para mí? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.5.questions.1.text` | Which steps will my surgery include? For example, will you remove bone only, or also open the covering of the brain and add a patch? | ¿Qué pasos incluirá mi cirugía? Por ejemplo, ¿solo retirará hueso, o también abrirá la membrana que cubre el cerebro y colocará un parche? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.5.questions.2.text` | How long will the surgery take, and how long will I stay in the hospital? | ¿Cuánto durará la cirugía y cuánto tiempo estaré en el hospital? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.5.questions.3.text` | When do I need to stop eating and drinking before surgery? | ¿Cuándo debo dejar de comer y beber antes de la cirugía? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.5.questions.4.text` | Will I spend time in intensive care after surgery? | ¿Pasaré tiempo en cuidados intensivos después de la cirugía? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.5.questions.5.text` | For a child: can a parent stay overnight, and be there when they wake up? | Para un niño: ¿puede uno de los padres quedarse durante la noche y estar presente cuando despierte? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.5.questions.6.text` | For a child: can their comfort item go into the operating room? | Para un niño: ¿puede llevar su peluche o cobija favorita al quirófano? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.5.questions.7.text` | How will my pain be managed after surgery? | ¿Cómo se controlará mi dolor después de la cirugía? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.5.questions.8.text` | Should I stop or change any of my medicines before surgery? | ¿Debo dejar de tomar o cambiar alguno de mis medicamentos antes de la cirugía? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.5.questions.9.text` | How soon can I go back to school, work or my usual activities? | ¿Cuándo puedo volver a la escuela, al trabajo o a mis actividades habituales? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.5.questions.10.text` | Could I need another surgery later? | ¿Podría necesitar otra cirugía más adelante? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.6.title` | Before going home from the hospital | Antes de salir del hospital |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.6.questions.0.text` | What should make me call you or come back to the hospital? | ¿En qué casos debo llamarle o volver al hospital? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.6.questions.1.text` | How do I care for my incision, and when can I shower? | ¿Cómo cuido mi incisión y cuándo puedo ducharme? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.6.questions.2.text` | Which medicines should I take at home, and for how long? | ¿Qué medicamentos debo tomar en casa y por cuánto tiempo? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.6.questions.3.text` | What should I avoid, and for how long? When can I lift things, drive or play sports? | ¿Qué debo evitar y por cuánto tiempo? ¿Cuándo puedo levantar cosas, manejar o hacer deporte? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.6.questions.4.text` | Who do I call with questions, including at night and on weekends? | ¿A quién llamo si tengo preguntas, también de noche y los fines de semana? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.6.questions.5.text` | When is my follow-up visit, and will I need another MRI? | ¿Cuándo es mi cita de seguimiento y necesitaré otra resonancia magnética? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.7.title` | Follow-up after surgery | Seguimiento después de la cirugía |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.7.questions.0.text` | Is my recovery going as expected? | ¿Mi recuperación va como se esperaba? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.7.questions.1.text` | Which of my symptoms are likely to get better, and how long might that take? | ¿Cuáles de mis síntomas es probable que mejoren, y cuánto podría tardar? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.7.questions.2.text` | Do I need more scans to check the fluid space, or my syrinx if I have one? | ¿Necesito más estudios de imagen para revisar el espacio del líquido, o mi siringe si la tengo? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.7.questions.3.text` | Can I go back to all my usual activities now? | ¿Ya puedo volver a todas mis actividades habituales? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.groups.7.questions.4.text` | Would physical therapy or another specialist help me? | ¿Me ayudaría la fisioterapia u otro especialista? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.diagramCaption` | Chiari I. Tonsils shown at their lowest point, where MRI measures them. Illustration, not a medical image. | Chiari I. Las amígdalas cerebelosas se muestran en su punto más bajo, donde se miden en la resonancia magnética. Ilustración, no es una imagen médica. | Chiari I. The cerebellar tonsils are shown at their lowest point, where they are measured on MRI. Illustration, not a medical image. |
| `about.how.checks` | Text and every 3D view are checked against the published sources listed in the evidence notes, by automatic measurements and independent audits, before they're published. They have not been reviewed by a medical professional. Last check: November 5, 2026. | Los textos y cada vista 3D se comparan con las fuentes publicadas que aparecen en las notas de evidencia, mediante mediciones automáticas y auditorías independientes, antes de publicarse. No han sido revisados por un profesional médico. Última comprobación: 5 de noviembre de 2026. | The texts and each 3D view are compared with the published sources that appear in the evidence notes, through automatic measurements and independent audits, before being published. They have not been reviewed by a medical professional. Last check: November 5, 2026. |
| `model.checks` | Measured against published sources; not reviewed by a medical professional | Medido según fuentes publicadas; no revisado por un profesional médico | Measured against published sources; not reviewed by a medical professional |
| `model.footnote` | Not medical advice. Illustrations for education, not medical images. | No es consejo médico. Ilustraciones con fines educativos, no son imágenes médicas. | It is not medical advice. Illustrations for educational purposes, they are not medical images. |
| `explain.starterNote` | In Chiari malformation, the lowest part of the cerebellum sits below the opening where the brain meets the spinal cord. This can crowd the space where spinal fluid flows, which can cause headaches and other symptoms. Symptoms can come and go, often with few outward signs. | En la malformación de Chiari, la parte más baja del cerebelo queda bajo la abertura en la base del cráneo y puede reducir el espacio del líquido cefalorraquídeo. Esto puede causar dolor de cabeza y otros síntomas, que pueden ir y venir, a menudo con pocas señales visibles. | In Chiari malformation, the lowest part of the cerebellum sits below the opening at the base of the skull and can reduce the cerebrospinal fluid space. This can cause headache and other symptoms, which can come and go, often with few visible signs. |
| `explain.lookingChiari.0` | The dashed line runs across the opening where the brain meets the spinal cord. | La línea punteada cruza la abertura donde el cerebro se une con la médula espinal. | The dotted line crosses the opening where the brain joins the spinal cord. |
| `explain.lookingChiari.1` | The lowest part of the cerebellum, the tonsils, sits below that line. The blue bracket shows how far. | La parte más baja del cerebelo, las amígdalas cerebelosas, queda por debajo de esa línea. El corchete azul muestra cuánto. | The lowest part of the cerebellum, the cerebellar tonsils, sits below that line. The blue bracket shows how much. |
| `explain.lookingChiari.2` | This can crowd the space where spinal fluid flows, which can cause headaches and other symptoms. | Esto puede reducir el espacio por donde circula el líquido cefalorraquídeo, lo que puede causar dolores de cabeza y otros síntomas. | This can reduce the space through which the cerebrospinal fluid flows, which can cause headaches and other symptoms. |
| `explain.helpTitle` | How you can help | Cómo puede ayudar | How you can help |
| `explain.help` | Symptoms can come and go, and there are often few outward signs. Believing them, and making room for rest, can mean a lot. | Los síntomas pueden ir y venir, y a menudo hay pocas señales visibles. Creerle a la persona y darle espacio para descansar puede significar mucho. | Symptoms can come and go, and often there are few visible signs. Believing the person and giving them space to rest can mean a lot. |
| `studies.beforeTitle` | Before you join a study | Antes de participar en un estudio | Before taking part in a study |
| `studies.before.wide` | Talk to your doctor, and ask the study team what's involved, what it costs you, and how your data is used. Summaries are simplified by Open Chiari; the official listing is the final word. | Hable con su médico y pregúntele al equipo del estudio en qué consiste, si tiene algún costo para usted y cómo se usan sus datos. Open Chiari simplifica los resúmenes; la ficha oficial es la que vale. | Talk with your doctor and ask the study team what it involves, how much it will cost you and how your data are used. Open Chiari simplifies the summaries; the official listing is the one that counts. **(changed since the back-translation; it reads the earlier Spanish)** |
| `studies.before.narrow` | Talk to your doctor, and ask the study team what's involved. The official listing is the final word. | Hable con su médico y pregúntele al equipo del estudio en qué consiste. La ficha oficial es la que vale. | Talk with your doctor and ask the study team what it involves. The official listing is the one that counts. |
| `impact.accuracy` | Accuracy checks | Comprobaciones de exactitud | Accuracy checks |
| `impact.accuracyValue` | November 5, 2026 · passed | 5 de noviembre de 2026 · superadas | November 5, 2026 · passed |
| `impact.accuracyMeans` | Text and 3D views checked against published sources; not reviewed by a medical professional | Textos y vistas 3D comparados con fuentes publicadas; no revisados por un profesional médico | Texts and 3D views compared with published sources; not reviewed by a medical professional |
| `compare.notes.typical` | Tonsils usually sit at or above the dashed line (a few millimeters below can be normal). The fluid space behind them is open. | Las amígdalas cerebelosas suelen estar a la altura de la línea punteada o por encima (unos pocos milímetros por debajo puede ser normal). El espacio del líquido detrás de ellas está abierto. | The cerebellar tonsils usually sit at the level of the dotted line or above (a few millimeters below can be normal). The fluid space behind them is open. |
| `compare.notes.chiari` | Tonsils extend below the line (blue bracket) and often crowd the space where fluid should pass. Red marks show where flow is often restricted. | Las amígdalas cerebelosas se extienden por debajo de la línea (corchete azul) y a menudo reducen el espacio por donde debería pasar el líquido. Las marcas rojas muestran dónde el flujo a menudo está restringido. | The cerebellar tonsils extend below the line (blue bracket) and often reduce the space where the fluid should pass. The red marks show where the flow is often restricted. |
| `tour.steps.0.text` | This view is cut down the middle of the head and neck. The cerebellum helps control balance and coordination. The foramen magnum is the opening at the base of the skull where the brainstem becomes the spinal cord. | Esta vista muestra la cabeza y el cuello cortados por la mitad, a lo largo de la línea media. El cerebelo ayuda a controlar el equilibrio y la coordinación. El agujero magno es la abertura en la base del cráneo donde el tronco encefálico se convierte en la médula espinal. | This view shows the head and neck cut in half, along the midline. The cerebellum helps control balance and coordination. The foramen magnum is the opening at the base of the skull where the brainstem becomes the spinal cord. |
| `tour.steps.1.text` | The tonsils usually sit at or above the dashed line across the skull opening (a few millimeters below can still be normal), and spinal fluid moves freely around them. | Las amígdalas cerebelosas suelen estar a la altura de la línea punteada que cruza la abertura del cráneo o por encima de ella (unos pocos milímetros por debajo todavía puede ser normal), y el líquido cefalorraquídeo circula libremente a su alrededor. | The cerebellar tonsils usually sit at the level of the dotted line that crosses the skull opening or above it (a few millimeters below can still be normal), and the cerebrospinal fluid flows freely around them. |
| `tour.steps.2.text` | The dashed line runs across the opening at the base of the skull. In Chiari, the tonsils, the lowest part of the cerebellum, extend below it, shown by the blue bracket. | La línea punteada cruza la abertura en la base del cráneo. En Chiari, las amígdalas cerebelosas, la parte más baja del cerebelo, se extienden por debajo de ella, como muestra el corchete azul. | The dotted line crosses the opening at the base of the skull. In Chiari, the cerebellar tonsils, the lowest part of the cerebellum, extend below it, as the blue bracket shows. |
| `tour.steps.3.text` | Cerebrospinal fluid is clear fluid that cushions the brain and spinal cord. With each heartbeat it pulses back and forth between the skull and the spinal canal. In Chiari, the tonsils extend below the line (blue bracket) and often crowd the space where fluid should pass. Red marks show where flow is often restricted. | El líquido cefalorraquídeo es un líquido transparente que amortigua el cerebro y la médula espinal. Con cada latido del corazón, se mueve de un lado a otro entre el cráneo y el canal espinal. En Chiari, las amígdalas cerebelosas se extienden por debajo de la línea (corchete azul) y a menudo reducen el espacio por donde debería pasar el líquido. Las marcas rojas muestran dónde el flujo a menudo está restringido. | Cerebrospinal fluid is a clear fluid that cushions the brain and the spinal cord. With each heartbeat, it moves back and forth between the skull and the spinal canal. In Chiari, the cerebellar tonsils extend below the line (blue bracket) and often reduce the space where the fluid should pass. The red marks show where the flow is often restricted. |
| `tour.steps.4.text` | A syrinx is a fluid-filled cavity inside the spinal cord. It often develops alongside Chiari, most often in the neck part of the spinal cord. | Una siringe es una cavidad llena de líquido dentro de la médula espinal. A menudo aparece junto con Chiari, sobre todo en la parte de la médula espinal que está en el cuello. | A syrinx is a fluid-filled cavity inside the spinal cord. It often appears together with Chiari, especially in the part of the spinal cord that is in the neck. |
| `kit.socialHeadline` | 1 picture of Chiari, explained. | Chiari, explicado en 1 imagen. | Chiari, explained in 1 image. |
| `kit.quote` | Chiari symptoms often have few outward signs. Ask how you can help. | Los síntomas de Chiari a menudo dan pocas señales visibles. Pregunte cómo puede ayudar. | Chiari symptoms often give few visible signs. Ask how you can help. |
| `kit.quoteFooter` | September · Chiari Awareness Month | Septiembre · Mes de Concientización sobre Chiari | September · Chiari Awareness Month |
| `kit.cardLine1` | I have Chiari malformation. | Tengo malformación de Chiari. | I have Chiari malformation. |
| `kit.cardLine2` | Scan to see Chiari malformation in 3D. | Escanee para ver la malformación de Chiari en 3D. | Scan to see Chiari malformation in 3D. |
| `studySummaries.NCT06502431.summary` | Researchers want to understand how spinal fluid and blood move in the head and neck in Chiari I. They use a special MRI that measures flow, comparing adults with and without symptoms to people without Chiari. | Los investigadores quieren entender cómo se mueven el líquido cefalorraquídeo y la sangre en la cabeza y el cuello en Chiari I. Usan una resonancia magnética especial que mide el flujo y comparan a adultos con y sin síntomas con personas sin Chiari. | The researchers want to understand how cerebrospinal fluid and blood move in the head and neck in Chiari I. They use a special MRI that measures flow and compare adults with and without symptoms with people without Chiari. |
| `studySummaries.NCT06502431.whatYoudDo` | Extra flow scans added to an MRI, on one day. For adults 18 to 50 with no past brain or spine surgery and no other nerve or heart conditions in their history (ask the study team what counts). Not for people who can't have an MRI, or who are pregnant or breastfeeding. People with Chiari are invited after a neurosurgery visit at the hospital in Amiens, and the team re-checks the scans to confirm Chiari I. | Estudios de flujo adicionales que se agregan a una resonancia magnética, en un solo día. Para adultos de 18 a 50 años sin cirugías previas del cerebro o la columna y sin antecedentes de otras afecciones de los nervios o del corazón (pregunte al equipo del estudio qué cuenta). No es para personas que no pueden hacerse una resonancia magnética ni para personas embarazadas o que estén amamantando. Se invita a las personas con Chiari después de una consulta de neurocirugía en el hospital de Amiens, y el equipo vuelve a revisar las imágenes para confirmar el Chiari I. | Additional flow studies that are added to an MRI, on a single day. For adults 18 to 50 years old without previous surgeries of the brain or spine and without a history of other conditions of the nerves or of the heart (ask the study team what counts). It is not for people who cannot have an MRI or for people who are pregnant or breastfeeding. People with Chiari are invited after a neurosurgery consultation at the Amiens hospital, and the team re-reviews the images to confirm the Chiari I. |
| `studySummaries.NCT06724029.summary` | Researchers want to learn what predicts how people do after brain and spine surgery, across many conditions including Chiari I. The study doesn't change anyone's treatment; it only collects health information before surgery and afterwards. | Los investigadores quieren saber qué predice cómo les va a las personas después de una cirugía del cerebro o la columna, en muchas afecciones, entre ellas Chiari I. El estudio no cambia el tratamiento de nadie; solo recopila información de salud antes de la cirugía y después. | The researchers want to know what predicts how people do after a surgery of the brain or spine, in many conditions, among them Chiari I. The study does not change anyone's treatment; it only collects health information before the surgery and after. |
| `studySummaries.NCT06724029.whatYoudDo` | Your health information is collected before surgery and during follow-up afterwards; how often and for how long depends on the condition, and the listing doesn't say. For adults having neurosurgery at one of the hospitals in Italy that are still taking new people (the official listing shows which). | Se recopila su información de salud antes de la cirugía y durante el seguimiento posterior; la frecuencia y la duración dependen de la afección, y la ficha no lo indica. Para adultos a quienes se les hará una neurocirugía en uno de los hospitales de Italia que todavía aceptan participantes nuevos (la ficha oficial muestra cuáles). | Your health information is collected before the surgery and during the later follow-up; the frequency and the duration depend on the condition, and the listing does not say. For adults who will have neurosurgery at one of the hospitals in Italy that are still accepting new participants (the official listing shows which ones). |

## Everything else (buttons, menus, page text)

| Key | English (approved) | Spanish (on the site) | Blind back-translation |
| --- | --- | --- | --- |
| `siteName` | Open Chiari | Open Chiari | Open Chiari |
| `skipLink` | Skip to content | Saltar al contenido | Skip to content |
| `header.mainNavLabel` | Main | Principal | Main |
| `header.menu` | Menu | Menú | Menu |
| `header.nav.explorer` | 3D Explorer | Explorador 3D | 3D Explorer |
| `header.nav.explain` | Explain It | Explain It | Explain It |
| `header.nav.studies` | Research studies | Estudios de investigación | Research studies |
| `header.nav.prep` | Visit prep | Prepare su cita | Prepare your appointment |
| `header.nav.model` | Open model | Modelo abierto | Open model |
| `header.nav.support` | Support | Apoyo | Support |
| `header.espanol` | Español | English | English |
| `header.calm` | Calm mode | Modo tranquilo | Calm mode |
| `header.dim` | Dim | Modo oscuro |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `header.dimLabel` | Dim mode: dark colors, less light | Modo oscuro: colores oscuros, menos luz |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `translation.label` | About this translation | Sobre esta traducción | About this translation |
| `translation.notice` | Translation pending review by a medical translator. It was made with the help of AI tools, and the English version is the reference. | Traducción pendiente de revisión por un traductor médico. Se hizo con ayuda de herramientas de inteligencia artificial, y la versión en inglés es la de referencia. | Translation pending review by a medical translator. It was made with the help of artificial intelligence tools, and the English version is the reference version. |
| `translation.noticeShort` | Translation pending review by a medical translator. | Traducción pendiente de revisión por un traductor médico. | Translation pending review by a medical translator. |
| `translation.link` | View in English | Ver en inglés | View in English |
| `calm.on` | Calm on | Tranquilo activado | Calm on |
| `calm.noteStrong` | Calm mode is on. | El modo tranquilo está activado. | Calm mode is on. |
| `calm.noteRest` | No motion or auto-rotation, larger text, softer colors. You can turn it off any time. | Sin movimiento ni rotación automática, texto más grande y colores más suaves. Puede desactivarlo cuando quiera. | No movement or automatic rotation, larger text and softer colors. You can turn it off whenever you want. |
| `calm.explorerNote` | In Calm mode, the model only moves when you move it. | En el modo tranquilo, el modelo solo se mueve cuando usted lo mueve. | In calm mode, the model only moves when you move it. |
| `listen.listen` | Listen | Escuchar |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `listen.stop` | Stop | Detener |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `listen.label` | Listen: your device reads this part aloud | Escuchar: su dispositivo lee esta parte en voz alta |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.eyebrow` | Chiari malformation, Type I | Malformación de Chiari, tipo I | Chiari malformation, type I |
| `home.title` | See what's happening at the base of the skull. | Vea lo que pasa en la base del cráneo. | See what happens at the base of the skull. |
| `home.openExplorer` | Open the 3D Explorer | Abrir el explorador 3D | Open the 3D explorer |
| `home.tour` | Take the 2-minute tour | Hacer el recorrido de 2 minutos | Take the 2-minute tour |
| `home.figNumber` | Fig. 1 | Fig. 1 | Fig. 1 |
| `home.say.title` | How do you say it? | ¿Cómo se dice? (en inglés) |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.say.items.0.term` | Chiari | Chiari |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.say.items.0.say` | key-AR-ee | key-AR-ee |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.say.items.1.term` | Chiari malformation | Chiari malformation |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.say.items.1.say` | key-AR-ee mal-fore-MAY-shun | key-AR-ee mal-fore-MAY-shun |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.say.items.2.term` | Syringomyelia | Syringomyelia |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.say.items.2.say` | suh-ring-go-my-EE-lee-uh | suh-ring-go-my-EE-lee-uh |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.say.items.3.term` | Syrinx | Syrinx |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.say.items.3.say` | SEER-inks | SEER-inks |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.say.key` | Capital letters show the part you say loudest. | Así se pronuncia en inglés; las mayúsculas muestran la parte que se dice más fuerte. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.say.history` | Hans Chiari first described Chiari malformations at the end of the 1800s. | Hans Chiari describió por primera vez las malformaciones de Chiari a finales del siglo XIX. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `home.tools.title` | Tools | Herramientas | Tools |
| `home.tools.items.0.title` | 3D Explorer | Explorador 3D | 3D Explorer |
| `home.tools.items.1.title` | Explain It | Explain It (Explíquelo) | Explain It (Explain it) |
| `home.tools.items.2.title` | Research studies | Estudios de investigación | Research studies |
| `home.tools.items.3.title` | Doctor visit prep | Prepare su cita médica | Prepare your medical appointment |
| `home.tools.items.4.title` | Open model | Modelo abierto | Open model |
| `home.tools.items.5.title` | Support Chiari organizations | Apoye a las organizaciones de Chiari | Support the Chiari organizations |
| `footer.factsBefore` | Facts adapted from the | Información adaptada de la | Information adapted from the |
| `footer.ninds` | NINDS fact sheet | hoja informativa del NINDS | NINDS fact sheet |
| `footer.modelBefore` | . 3D model by Open Chiari, CC BY-SA 4.0, adapted from | . Modelo 3D de Open Chiari, CC BY-SA 4.0, adaptado de | . 3D model by Open Chiari, CC BY-SA 4.0, adapted from |
| `footer.zAnatomy` | Z-Anatomy | Z-Anatomy | Z-Anatomy |
| `footer.modelAfter` | (CC BY-SA 4.0) and BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP). | (CC BY-SA 4.0) y BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP). | (CC BY-SA 4.0) and BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP). |
| `footer.personalProject` | A personal project by Matthew Borgfeld. | Un proyecto personal de Matthew Borgfeld. | A personal project of Matthew Borgfeld. |
| `footer.moreNavLabel` | More | Más | More |
| `footer.links.children` | Helping your child | Cómo ayudar a su hijo |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `footer.links.support` | Support | Apoyo | Support |
| `footer.links.kit` | Awareness kit | Kit de concientización | Awareness kit |
| `footer.links.impact` | Impact | Impacto | Impact |
| `footer.links.openSource` | Open source | Código abierto | Open source |
| `footer.links.about` | About and contact | Acerca del sitio y contacto | About and contact **(changed since the back-translation; it reads the earlier Spanish)** |
| `footer.links.privacy` | Privacy | Privacidad | Privacy |
| `explorer.title` | 3D Explorer | Explorador 3D | 3D Explorer |
| `explorer.backHome` | Back to home | Volver al inicio | Back to home |
| `explorer.explain` | Explain It | Explain It | Explain It |
| `explorer.explainAria` | Explain It: share this view | Explain It: compartir esta vista | Explain It: share this view |
| `explorer.condition` | Condition | Afección | Condition |
| `explorer.conditions.typical.short` | Typical | Típica | Typical |
| `explorer.conditions.chiari.short` | Chiari I | Chiari I | Chiari I |
| `explorer.conditions.syrinx.short` | With syrinx | Con siringe | With syrinx |
| `explorer.conditions.surgery.short` | After surgery | Después de la cirugía | After surgery |
| `explorer.layers` | Layers | Capas | Layers |
| `explorer.layerNames.skin` | Skin | Piel | Skin |
| `explorer.layerNames.bone` | Skull and spine | Cráneo y columna | Skull and spine |
| `explorer.layerNames.brain` | Brain | Cerebro | Brain |
| `explorer.layerNames.csf` | Spinal fluid | Líquido cefalorraquídeo | Cerebrospinal fluid |
| `explorer.layerNames.nerves` | Nerves | Nervios | Nerves |
| `explorer.layerNames.vessels` | Blood vessels | Vasos sanguíneos | Blood vessels |
| `explorer.opacitySuffix` |  opacity | : opacidad | : opacity |
| `explorer.cutaway` | Cut-away | Corte | Cut |
| `explorer.cutawayAria` | Cut-away depth | Profundidad del corte | Cut depth |
| `explorer.cutWhole` | Whole | Entero | Whole |
| `explorer.cutMidline` | Midline | Línea media | Midline |
| `explorer.cutFar` | Far side | Lado opuesto | Opposite side |
| `explorer.model` | Model | Modelo | Model |
| `explorer.realistic` | Realistic | Realista | Realistic |
| `explorer.simple` | Simple | Sencillo | Simple |
| `explorer.viewTools` | View tools | Herramientas de la vista | View tools |
| `explorer.flow` | Fluid flow | Flujo del líquido | Fluid flow |
| `explorer.flowShort` | Flow | Flujo | Flow |
| `explorer.labels` | Labels | Nombres | Names |
| `explorer.measure` | Measure | Medir | Measure |
| `explorer.ar` | See it in your room | Véalo en su habitación |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.arHint` | Point your phone at a table or the floor, then tap to place the model. It is life size; walk around it. | Apunte el teléfono hacia una mesa o el piso y toque la pantalla para colocar el modelo. Tiene tamaño real; camine a su alrededor. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.close` | Close | Cerrar | Close |
| `explorer.viewerLabel` | Anatomy view | Vista de la anatomía | Anatomy view |
| `explorer.evidence` | Evidence notes for this view | Notas de evidencia de esta vista | Evidence notes for this view |
| `explorer.structures` | Structures | Estructuras | Structures |
| `explorer.search` | Search parts | Buscar partes | Search parts |
| `explorer.selected` | selected | seleccionada | selected |
| `explorer.partsButton` | Parts list · tap a part in the model | Lista de partes · toque una parte del modelo | Parts list · tap a part of the model |
| `explorer.viewOptions` | View and layers | Vista y capas | View and layers |
| `explorer.hint` | Drag to rotate · Scroll to zoom · Shift-drag to move | Arrastre para girar · Desplácese para acercar o alejar · Mantenga Mayús y arrastre para mover | Drag to rotate · Scroll to zoom in or out · Shift and drag to move **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.camera` | Camera | Cámara | Camera |
| `explorer.cameraViews.side` | Side | Lado | Side |
| `explorer.cameraViews.back` | Back | Atrás | Back |
| `explorer.cameraViews.below` | Below | Abajo | Below |
| `explorer.cameraViews.front` | Front | Frente | Front |
| `explorer.resetCamera` | Reset camera | Restablecer la cámara | Reset the camera |
| `explorer.viewerRole` | 3D model | Modelo 3D | 3D model |
| `explorer.keysHelp` | Arrow keys turn the model. Shift and arrow keys move it. Plus and minus zoom. Press 1 for side, 2 for back, 3 for below, 4 for front, and 0 to reset. | Las flechas giran el modelo. Mayús y las flechas lo mueven. Más y menos acercan y alejan. Pulse 1 para la vista de lado, 2 para atrás, 3 para abajo, 4 para el frente y 0 para restablecer. | The arrows rotate the model. Shift and the arrows move it. Plus and minus zoom in and out. Press 1 for the side view, 2 for back, 3 for below, 4 for the front and 0 to reset. |
| `explorer.viewNames.side` | Side view | Vista de lado | Side view |
| `explorer.viewNames.back` | Back view | Vista desde atrás | View from behind |
| `explorer.viewNames.below` | View from below | Vista desde abajo | View from below |
| `explorer.viewNames.front` | Front view | Vista de frente | Front view |
| `explorer.viewNames.custom` | Turned view | Vista girada | Rotated view |
| `explorer.cutNames.whole` | Whole model | Modelo entero | Whole model |
| `explorer.cutNames.near` | Cut part way, near side removed | Corte parcial, sin el lado cercano | Partial cut, without the near side |
| `explorer.cutNames.midline` | Cut at the midline | Corte en la línea media | Cut at the midline |
| `explorer.cutNames.far` | Cut past the midline, toward the far side | Corte pasada la línea media, hacia el lado opuesto | Cut past the midline, toward the opposite side |
| `explorer.evidencePage` | Evidence notes | Notas de evidencia | Evidence notes |
| `explorer.notInModel` | Not in this model yet | Aún no están en este modelo | Not yet in this model |
| `explorer.cough.title` | Why can coughing bring on a headache? | ¿Por qué toser puede provocar un dolor de cabeza? |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.cough.text.0` | A cough briefly raises the pressure in your chest, which pushes some spinal fluid up from the spine into the head. Normally it then flows back down. | Al toser, la presión en el pecho sube por un momento, y eso empuja algo de líquido cefalorraquídeo desde la columna hacia la cabeza. Normalmente, después vuelve a bajar. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.cough.text.1` | One explanation is that, in some people with Chiari I, the low tonsils get in the way as the fluid flows back, so just after a cough they are pushed further down into the opening. | Una explicación es que, en algunas personas con Chiari I, las amígdalas cerebelosas bajas estorban el paso del líquido cuando vuelve a bajar, por lo que justo después de toser son empujadas más hacia abajo, dentro de la abertura. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.cough.text.2` | Researchers don't all agree on how this works, or whether it's why coughing can bring on the classic headache. Not everyone with Chiari gets these headaches. | No todos los investigadores están de acuerdo en cómo funciona esto, ni en si es la razón por la que toser puede provocar el dolor de cabeza clásico. No todas las personas con Chiari tienen estos dolores de cabeza. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.cough.button` | Cough | Toser |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.cough.caption` | Animation simplified. | Animación simplificada. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.cough.up` | During the cough: some spinal fluid moves up from the spine into the head. | Al toser: algo de líquido cefalorraquídeo sube desde la columna hacia la cabeza. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.cough.back` | Then it flows back down. | Después vuelve a bajar. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.sizeNote` | The usual cutoff, about 5 mm, is half a centimeter, about the height of 3 stacked quarters. The model shows about 12 mm, a little over 1 centimeter, about the height of 7 stacked quarters. How far the tonsils extend doesn't always match how someone feels. | El límite habitual, unos 5 mm, es medio centímetro, más o menos la altura de 3 monedas de 25 centavos de EE. UU. apiladas. El modelo muestra unos 12 mm, algo más de 1 centímetro, más o menos la altura de 7 de esas monedas apiladas. Lo que bajan las amígdalas cerebelosas no siempre coincide con cómo se siente una persona. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.title` | What happens in surgery, step by step | Qué pasa en la cirugía, paso a paso |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.intro` | Surgeons don't all do the same operation. Some remove bone only, some also open the brain's covering and add a patch, and some also shrink the tonsils. This shows one common version. Your surgeon can tell you which steps apply to you. | No todos los cirujanos hacen la misma operación. Algunos solo retiran hueso, otros también abren la membrana que cubre el cerebro y colocan un parche, y otros además reducen las amígdalas cerebelosas. Esto muestra una versión común. Su cirujano puede decirle qué pasos se aplican en su caso. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.play` | Play | Reproducir |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.pause` | Pause | Pausa |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.back` | Back | Atrás |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.next` | Next | Siguiente |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.stop` | Show the usual view | Mostrar la vista habitual |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.stepLabel` | Step {n} of {total} | Paso {n} de {total} |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.steps.0.title` | Before surgery | Antes de la cirugía |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.steps.0.text` | In Chiari I, the tonsils extend below the opening at the base of the skull. This can crowd the space where spinal fluid flows. | En Chiari I, las amígdalas cerebelosas se extienden por debajo de la abertura en la base del cráneo. Esto puede reducir el espacio por donde fluye el líquido cefalorraquídeo. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.steps.1.title` | The incision | La incisión |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.steps.1.text` | The person is asleep under anesthesia. The surgeon makes a cut down the middle of the back of the head and upper neck, and moves the muscles aside to reach the bone. | La persona está dormida con anestesia. El cirujano hace un corte por el centro de la parte de atrás de la cabeza y la parte alta del cuello, y aparta los músculos para llegar al hueso. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.steps.2.title` | Bone removed | Hueso retirado |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.steps.2.text` | A small piece of bone is removed at the back of the skull opening, and often the back of the first neck bone (vertebra), to make more room. | Se retira un pequeño trozo de hueso de la parte de atrás de la abertura del cráneo y, a menudo, la parte de atrás del primer hueso del cuello (vértebra), para hacer más espacio. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.steps.3.title` | The patch | El parche |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.steps.3.text` | Often the surgeon also opens the brain's protective covering (the dura) and sews in a patch, like letting out a waistband, to make more room for spinal fluid. Then the muscles and skin are closed. | A menudo el cirujano también abre la membrana protectora del cerebro (la duramadre) y cose un parche, como cuando se suelta la cintura de un pantalón, para dar más espacio al líquido cefalorraquídeo. Luego se cierran los músculos y la piel. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.steps.4.title` | Afterward | Después |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.steps.4.text` | On scans after surgery, the fluid space behind the cerebellum is often larger, and the tonsils often rise only partly. | En los estudios de imagen después de la cirugía, el espacio del líquido detrás del cerebelo a menudo es más grande, y las amígdalas cerebelosas a menudo suben solo en parte. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explorer.surgery.caption` | Animation simplified. The incision line is approximate; its length varies. | Animación simplificada. La línea de la incisión es aproximada; su longitud varía. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `evidence.inEnglish` | These notes are in English, like the sources they cite. | Estas notas están en inglés, igual que las fuentes que citan. | These notes are in English, the same as the sources they cite. |
| `evidence.intro` | The evidence notes list every medical sentence and every 3D shape on the site with the source it rests on. They are the working file the site is built from, so they also name files and checks used by the people who maintain it. | Las notas de evidencia indican cada frase médica y cada forma 3D del sitio con la fuente en la que se basa. Son el archivo de trabajo con el que se hace el sitio, así que también mencionan archivos y comprobaciones que usan las personas que lo mantienen. | The evidence notes give each medical sentence and each 3D shape on the site with the source it is based on. They are the working file the site is made with, so they also mention files and checks used by the people who maintain it. |
| `prep.title` | Prepare for your next appointment | Prepárese para su próxima cita | Prepare for your next appointment |
| `prep.intro.wide` | Tick the questions you want to ask, add your own, and print a one-page sheet. Everything stays on your device; nothing is saved or sent. | Marque las preguntas que quiere hacer, agregue las suyas e imprima una hoja de una página. Todo se queda en su dispositivo; no se guarda ni se envía nada. | Check the questions you want to ask, add your own and print a one-page sheet. Everything stays on your device; nothing is saved or sent. |
| `prep.intro.narrow` | Tick what you want to ask. Nothing is saved or sent. | Marque lo que quiere preguntar. No se guarda ni se envía nada. | Check what you want to ask. Nothing is saved or sent. |
| `prep.formLabel` | Choose questions | Elija las preguntas | Choose the questions |
| `prep.addOwn` | Add your own question | Agregue su propia pregunta | Add your own question |
| `prep.add` | Add | Agregar | Add |
| `prep.mention` | Things I want to mention | Cosas que quiero mencionar | Things I want to mention |
| `prep.sheetCount.one` | Your sheet · 1 question | Su hoja · 1 pregunta | Your sheet · 1 question |
| `prep.sheetCount.other` | Your sheet · {n} questions | Su hoja · {n} preguntas | Your sheet · {n} questions |
| `prep.selectedCount.one` | 1 question selected | 1 pregunta seleccionada | 1 question selected |
| `prep.selectedCount.other` | {n} questions selected | {n} preguntas seleccionadas | {n} questions selected |
| `prep.sheetTitle` | Questions for my doctor | Preguntas para mi médico | Questions for my doctor |
| `prep.answerSpace` | Space for answers is added under each question when printed. | Al imprimir, se agrega espacio para las respuestas debajo de cada pregunta. | When printing, space for the answers is added below each question. |
| `prep.print` | Print sheet | Imprimir la hoja | Print the sheet |
| `prep.previewPrint` | Preview and print | Ver e imprimir | View and print |
| `prep.pdf` | Save as PDF | Guardar como PDF | Save as PDF |
| `prep.diagram` | Include a small diagram of Chiari | Incluir un pequeño diagrama de Chiari | Include a small Chiari diagram |
| `prep.pageNote` | Not medical advice. Your choices on this page are never stored or sent. | No es consejo médico. Lo que elija en esta página nunca se guarda ni se envía. | It is not medical advice. What you choose on this page is never saved or sent. |
| `prep.sheetMeta` | Chiari malformation · Date: ____________ · Doctor: ______________________ | Malformación de Chiari · Fecha: ____________ · Médico: ______________________ | Chiari malformation · Date: ____________ · Doctor: ______________________ |
| `prep.sheetFooter` | Made with Open Chiari · openchiari.org · Not medical advice | Hecho con Open Chiari · openchiari.org · No es consejo médico | Made with Open Chiari · openchiari.org · It is not medical advice |
| `prep.pack.title` | Packing for a hospital stay | Qué llevar para una estadía en el hospital |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.intro` | Your hospital may send its own list. Follow theirs first. | Es posible que su hospital le envíe su propia lista. Siga primero la del hospital. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.items.0` | Health insurance card and photo ID | Tarjeta del seguro médico e identificación con foto |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.items.1` | Custody papers, if they apply | Documentos de custodia, si corresponde |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.items.2` | Your medicines, or a list of them (ask the hospital which to bring) | Sus medicamentos o una lista de ellos (pregunte en el hospital cuáles llevar) |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.items.3` | Glasses, hearing aids, a CPAP machine or other equipment you use | Lentes, aparatos auditivos, una máquina CPAP u otro equipo que use |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.items.4` | Toothbrush and other toiletries | Cepillo de dientes y otros artículos de aseo |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.items.5` | Comfortable clothes for going home | Ropa cómoda para volver a casa |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.items.6` | Non-slip slippers | Pantuflas antideslizantes |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.items.7` | Phone and chargers | Teléfono y cargadores |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.items.8` | Books, a tablet or games, and headphones | Libros, una tableta o juegos, y audífonos para escuchar |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.items.9` | For a child: a favorite blanket or stuffed animal | Para un niño: su cobija o peluche favorito |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.items.10` | For the parent: snacks and a water bottle | Para los padres: refrigerios y una botella de agua |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.items.11` | Your questions sheet from this page | Su hoja de preguntas de esta página |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.print` | Print packing list | Imprimir la lista |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.pack.formLabel` | Packing list | Lista de cosas para llevar |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.child.before` | Getting a child ready for surgery? See | ¿Está preparando a un niño para la cirugía? Vea |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.child.link` | Helping your child | Cómo ayudar a su hijo |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `prep.child.after` | . | . |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.title` | Support the groups doing the work | Apoye a los grupos que hacen el trabajo | Support the groups that do the work |
| `support.intro.wide` | These nonprofits fund research and support families, and one keeps an international patient registry. Open Chiari doesn't take donations; every link below goes straight to the organization's own page. | Estas organizaciones sin fines de lucro financian la investigación y apoyan a las familias, y una de ellas mantiene un registro internacional de pacientes. Open Chiari no acepta donaciones; cada enlace de abajo lleva directamente a la página de la organización. | These nonprofit organizations fund research and support families, and one of them maintains an international patient registry. Open Chiari does not accept donations; each link below goes directly to the organization's page. |
| `support.intro.narrow` | Open Chiari doesn't take donations. Every link goes to the organization's own page. | Open Chiari no acepta donaciones. Cada enlace lleva a la página de la organización. | Open Chiari does not accept donations. Each link goes to the organization's page. |
| `support.orgs.0.name` | Bobby Jones Chiari & Syringomyelia Foundation | Bobby Jones Chiari & Syringomyelia Foundation | Bobby Jones Chiari & Syringomyelia Foundation |
| `support.orgs.0.text.wide` | Maintains an international patient registry (new enrollment currently paused), hosts a yearly research colloquium, and funds Chiari research grants and fellowships. | Mantiene un registro internacional de pacientes (las nuevas inscripciones están en pausa), organiza un coloquio anual de investigación y financia becas y subvenciones para la investigación de Chiari. | Maintains an international patient registry (new enrollments are paused), organizes an annual research colloquium and funds fellowships and grants for Chiari research. |
| `support.orgs.0.text.narrow` | International patient registry (enrollment paused), a yearly research colloquium, and research grants and fellowships. | Registro internacional de pacientes (inscripciones en pausa), un coloquio anual de investigación, y becas y subvenciones para la investigación. | International patient registry (enrollments paused), an annual research colloquium, and fellowships and grants for research. |
| `support.orgs.0.tags` | Research · Patient registry · Education | Investigación · Registro de pacientes · Educación | Research · Patient registry · Education |
| `support.orgs.0.second` | Registry and research | Registro e investigación | Registry and research |
| `support.orgs.1.name` | Conquer Chiari | Conquer Chiari | Conquer Chiari |
| `support.orgs.1.text.wide` | Funds Chiari research, publishes patient education materials, and supported the Chiari1000 patient registry (now closed). | Financia la investigación de Chiari, publica materiales educativos para pacientes y apoyó el registro de pacientes Chiari1000 (ya cerrado). | Funds Chiari research, publishes educational materials for patients and supported the Chiari1000 patient registry (now closed). |
| `support.orgs.1.text.narrow` | Funds research and publishes patient education materials. | Financia la investigación y publica materiales educativos para pacientes. | Funds research and publishes educational materials for patients. |
| `support.orgs.1.tags` | Research funding · Education | Financiación de la investigación · Educación | Research funding · Education |
| `support.orgs.1.second` | Learn more | Más información | More information |
| `support.orgs.2.name` | ASAP: American Syringomyelia & Chiari Alliance Project | ASAP: American Syringomyelia & Chiari Alliance Project | ASAP: American Syringomyelia & Chiari Alliance Project |
| `support.orgs.2.text.wide` | Supports patients and families, publishes a newsletter, and has helped fund research into the genetics of Chiari. | Apoya a pacientes y familias, publica un boletín y ha ayudado a financiar la investigación sobre la genética de Chiari. | Supports patients and families, publishes a newsletter and has helped fund research on the genetics of Chiari. |
| `support.orgs.2.text.narrow` | Patient and family support, a newsletter, and research funding. | Apoyo a pacientes y familias, un boletín y financiación de la investigación. | Support for patients and families, a newsletter and research funding. |
| `support.orgs.2.tags` | Patient support · Research funding | Apoyo a pacientes · Financiación de la investigación | Patient support · Research funding |
| `support.orgs.2.second` | Learn more | Más información | More information |
| `support.donate` | Donate on their site | Donar en el sitio web de la organización | Donate on the organization's website |
| `support.otherTitle` | Other ways to help | Otras formas de ayudar | Other ways to help |
| `support.other.0.title` | Join a research study | Participe en un estudio de investigación | Take part in a research study |
| `support.other.0.text` | Studies recruiting now, updated daily. | Estudios que buscan participantes ahora, actualizados a diario. | Studies looking for participants now, updated daily. |
| `support.other.1.title` | Spread awareness in September | Ayude a crear conciencia en septiembre | Spread information in September **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.other.1.text` | Free graphics and cards for Chiari Awareness Month. | Gráficos y tarjetas gratis para el Mes de Concientización sobre Chiari. | Free graphics and cards for Chiari Awareness Month. |
| `support.other.2.title` | Share an Explain It link | Comparta un enlace de Explain It | Share an Explain It link |
| `support.other.2.text` | Help one person understand Chiari today. | Ayude hoy a una persona a entender Chiari. | Help a person understand Chiari today. |
| `support.notAffiliated` | Open Chiari is not affiliated with these organizations and receives nothing from donations. | Open Chiari no está afiliado a estas organizaciones y no recibe nada de las donaciones. Sus sitios web pueden estar solo en inglés. | Open Chiari is not affiliated with these organizations and receives nothing from the donations. Their websites may be in English only. |
| `support.connect.title` | Connect with others | Conectar con otras personas |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.intro` | Talking with people who have been through it can help. These communities are run by other organizations, not by Open Chiari, and being listed here isn't a recommendation. What these sites and their members share isn't checked by Open Chiari and isn't medical advice. | Hablar con personas que han pasado por lo mismo puede ayudar. Estas comunidades las dirigen otras organizaciones, no Open Chiari, y aparecer aquí no es una recomendación. Lo que comparten estos sitios y sus miembros no lo revisa Open Chiari y no es consejo médico. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.privacy` | Before you post, read each site's privacy policy. On some sites, posts can be read by anyone on the internet. | Antes de publicar, lea la política de privacidad de cada sitio. En algunos sitios, cualquier persona en internet puede leer las publicaciones. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.0.name` | Chiari Support (Ben's Friends) | Chiari Support (Ben's Friends) |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.0.kind` | Online forum | Foro en línea, en inglés |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.0.text` | A support forum for patients, families and friends, part of Ben's Friends, a network of patient communities for rare diseases. Members can be as young as 12. | Un foro de apoyo para pacientes, familias y amigos, parte de Ben's Friends, una red de comunidades de pacientes con enfermedades raras. Los miembros pueden tener desde 12 años. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.0.link` | Visit Chiari Support | Visitar Chiari Support |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.1.name` | Bobby Jones CSF Support Community | Comunidad de apoyo de Bobby Jones CSF |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.1.kind` | Online community on Inspire | Comunidad en línea en Inspire, en inglés |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.1.text` | An online community for patients and families living with Chiari malformation, syringomyelia and related disorders. Bobby Jones CSF says you choose how anonymous you are. | Una comunidad en línea para pacientes y familias que viven con malformación de Chiari, siringomielia y trastornos relacionados. Bobby Jones CSF dice que usted decide qué tan anónimo quiere ser. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.1.link` | Visit the community | Visitar la comunidad |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.2.name` | ASAP support groups | Grupos de apoyo de ASAP |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.2.kind` | Video, phone and in person | Por video, por teléfono y en persona, en inglés |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.2.text` | Monthly support groups over Zoom, monthly phone support groups, and help finding a local group that meets in person. | Grupos de apoyo mensuales por Zoom, grupos de apoyo mensuales por teléfono y ayuda para encontrar un grupo local que se reúne en persona. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.2.link` | Find a group | Buscar un grupo |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.3.name` | FEMACPA (Spain) | FEMACPA (España) |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.3.kind` | In Spanish | En español |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.3.text` | The Spanish federation of Chiari patient associations. It offers support after diagnosis. | La federación española de asociaciones de pacientes con Chiari. Ofrece apoyo después del diagnóstico. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `support.connect.groups.3.link` | Visit FEMACPA | Visitar FEMACPA |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `about.title` | About Open Chiari | Acerca de Open Chiari | About Open Chiari |
| `about.intro` | Open Chiari is a free, independent website that helps people see and understand Chiari malformation, and points them to the organizations and research moving the field forward. | Open Chiari es un sitio web gratuito e independiente que ayuda a las personas a ver y entender la malformación de Chiari, y les indica las organizaciones y las investigaciones que hacen avanzar este campo. | Open Chiari is a free and independent website that helps people see and understand Chiari malformation, and points them to the organizations and research that move this field forward. |
| `about.howTitle` | How the content is made | Cómo se hace el contenido | How the content is made |
| `about.how.factsBefore` | Medical facts are adapted from the | La información médica está adaptada de la | The medical information is adapted from the |
| `about.how.ninds` | NINDS fact sheet | hoja informativa del NINDS | NINDS fact sheet |
| `about.how.factsAfter` | and other published sources, listed in the | y de otras fuentes publicadas, que se indican en las | and from other published sources, which are listed in the |
| `about.how.evidenceLink` | evidence notes | notas de evidencia | evidence notes |
| `about.how.factsEnd` | . | . | . |
| `about.how.modelBefore` | The 3D model is built from | El modelo 3D está hecho a partir de | The 3D model is made from |
| `about.how.zAnatomy` | Z-Anatomy | Z-Anatomy | Z-Anatomy |
| `about.how.modelAfter` | and BodyParts3D, open anatomy data. | y BodyParts3D, datos de anatomía abiertos. | and BodyParts3D, open anatomy data. |
| `about.how.ai` | AI tools helped write the code and first drafts; every page is checked by a person. | Herramientas de inteligencia artificial ayudaron a escribir el código y los primeros borradores; una persona revisa cada página. | Artificial intelligence tools helped write the code and the first drafts; a person reviews each page. |
| `about.principlesTitle` | Principles | Principios | Principles |
| `about.principles.0.term` | Free, always | Gratis, siempre | Free, always |
| `about.principles.0.text` | No paywalls, ads or premium tiers. | Sin muros de pago, anuncios ni planes premium. | No paywalls, ads or premium plans. |
| `about.principles.1.term` | No personal data | Sin datos personales | No personal data |
| `about.principles.1.text` | No accounts and no cookies. | Sin cuentas y sin cookies. | No accounts and no cookies. |
| `about.principles.1.link` | Read the privacy policy | Lea la política de privacidad | Read the privacy policy |
| `about.principles.2.term` | Open source | Código abierto | Open source |
| `about.principles.2.text` | Code and model are public, so anyone can keep it going. | El código y el modelo son públicos, para que cualquiera pueda mantener el proyecto. | The code and the model are public, so that anyone can maintain the project. |
| `about.principles.2.link` | See the code | Vea el código | See the code |
| `about.principles.3.term` | Independent | Independiente | Independent |
| `about.principles.3.text` | Not affiliated with any company, hospital or nonprofit, and no money from donations. | Sin afiliación con ninguna empresa, hospital ni organización sin fines de lucro, y sin dinero de donaciones. | No affiliation with any company, hospital or nonprofit organization, and no donation money. |
| `about.principles.4.term` | Not medical advice | No es consejo médico | It is not medical advice |
| `about.principles.4.text` | Open Chiari explains; your doctor diagnoses and treats. | Open Chiari explica; su médico diagnostica y trata. | Open Chiari explains; your doctor diagnoses and treats. |
| `about.correctionsTitle` | Corrections | Correcciones | Corrections |
| `about.corrections` | Spot something wrong or out of date? Email with the page and what to fix. Corrections are made as quickly as possible, and every change is listed in the site's public code history. | ¿Ve algo incorrecto o desactualizado? Escríbanos con la página y lo que hay que corregir. Las correcciones se hacen lo antes posible, y cada cambio queda registrado en el historial público del código del sitio. | See something incorrect or out of date? Write to us with the page and what needs to be corrected. Corrections are made as soon as possible, and each change is recorded in the public history of the site's code. |
| `about.contactTitle` | Contact | Contacto | Contact |
| `about.contact` | For corrections, organizations, researchers and press. | Para correcciones, organizaciones, investigadores y prensa. | For corrections, organizations, researchers and press. |
| `about.email` | hello@openchiari.org | hello@openchiari.org | hello@openchiari.org |
| `about.noMedical` | Please don't send medical details. Open Chiari can't give medical advice. | Por favor, no envíe información médica. Open Chiari no puede dar consejos médicos. | Please do not send medical information. Open Chiari cannot give medical advice. |
| `about.madeByTitle` | Made by | Hecho por | Made by |
| `about.madeBy` | Matthew Borgfeld, as an independent project. | Matthew Borgfeld, como proyecto independiente. | Matthew Borgfeld, as an independent project. |
| `privacy.title` | Privacy | Privacidad | Privacy |
| `privacy.updated` | Last updated November 5, 2026 | Última actualización: 5 de noviembre de 2026 | Last updated: November 5, 2026 |
| `privacy.short` | The short version: Open Chiari doesn't know who you are, doesn't use cookies, and never collects health information. | En resumen: Open Chiari no sabe quién es usted, no usa cookies y nunca recopila información de salud. | In short: Open Chiari does not know who you are, does not use cookies and never collects health information. |
| `privacy.countedTitle` | What is counted | Lo que se cuenta | What is counted |
| `privacy.counted.before` | To show the totals on the | Para mostrar los totales en la | To show the totals on the |
| `privacy.counted.impact` | Impact page | página de Impacto | Impact page |
| `privacy.counted.after` | , the site counts visits and a few actions: opening the 3D model, making an Explain It link, and opening a study listing. Counting uses Open Chiari's own counter, which uses no cookies and doesn't build a profile of you. Your browser sends only the name of the action, and the counter adds 1 to a total. It doesn't keep your address, device, browser, country, the page you came from, or the link. When the 3D model is shown on another website, that website's address is noted, so the Impact page can count the sites that use it. | , el sitio cuenta las visitas y algunas acciones: abrir el modelo 3D, crear un enlace de Explain It y abrir la ficha de un estudio. Para contar se usa el contador propio de Open Chiari, que no usa cookies ni crea un perfil suyo. Su navegador envía solo el nombre de la acción, y el contador suma 1 a un total. No guarda su dirección, dispositivo, navegador, país, la página de la que viene ni el enlace. Cuando el modelo 3D se muestra en otro sitio web, se anota la dirección de ese sitio, para que la página de Impacto pueda contar los sitios que lo usan. | , the site counts visits and a few actions: opening the 3D model, creating an Explain It link and opening a study's listing. For counting, Open Chiari's own counter is used, which does not use cookies or create a profile of you. Your browser sends only the name of the action, and the counter adds 1 to a total. It does not save your address, device, browser, country, the page you come from or the link. When the 3D model is shown on another website, the address of that site is noted, so that the Impact page can count the sites that use it. |
| `privacy.neverTitle` | What is never collected | Lo que nunca se recopila | What is never collected |
| `privacy.never.0.term` | Your identity | Su identidad | Your identity |
| `privacy.never.0.text` | No accounts, sign-ins, names or email addresses. | Sin cuentas, inicios de sesión, nombres ni direcciones de correo electrónico. | No accounts, sign-ins, names or email addresses. |
| `privacy.never.1.term` | Explain It notes | Las notas de Explain It | Explain It notes |
| `privacy.never.1.text` | Your note goes in the message you send, not in the link. The link holds only the chosen view, after the #. Browsers don't send that part to our server, and the counter never receives it. | Su nota va en el mensaje que usted envía, no en el enlace. El enlace solo contiene la vista elegida, después del #. Los navegadores no envían esa parte a nuestro servidor, y el contador nunca la recibe. | Your note goes in the message you send, not in the link. The link only contains the chosen view, after the #. Browsers do not send that part to our server, and the counter never receives it. |
| `privacy.never.2.term` | Visit prep questions | Las preguntas para su cita | The questions for your appointment |
| `privacy.never.2.text` | Built and printed entirely in your browser. Nothing you tick or type leaves your device. | Se crean e imprimen por completo en su navegador. Nada de lo que marque o escriba sale de su dispositivo. | They are created and printed entirely in your browser. Nothing you check or type leaves your device. |
| `privacy.never.3.term` | Your location | Su ubicación | Your location |
| `privacy.never.3.text` | The "Near" box on Research studies sorts the list on your device and is never sent. | El cuadro "Cerca de" en Estudios de investigación ordena la lista en su dispositivo y nunca se envía. | The "Near" box in Research studies sorts the list on your device and is never sent. |
| `privacy.never.4.term` | Your camera | Su cámara | Health information **(changed since the back-translation; it reads the earlier Spanish)** |
| `privacy.never.4.text` | The site never receives the camera picture from "See it in your room"; your phone's own AR feature handles it. | El sitio nunca recibe la imagen de la cámara de "Véalo en su habitación"; la función de realidad aumentada de su propio teléfono se encarga de ella. | None, anywhere on the site. **(changed since the back-translation; it reads the earlier Spanish)** |
| `privacy.never.5.term` | Health information | Información de salud |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `privacy.never.5.text` | None, anywhere on the site. | Ninguna, en ninguna parte del sitio. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `privacy.savedTitle` | Saved on your device | Lo que se guarda en su dispositivo | What is saved on your device |
| `privacy.saved` | Calm mode and Dim mode are remembered in your own browser so they stay on next time. So the site also works without a signal, your browser keeps a copy of its pages and files; nothing you type or choose is in it. Clearing your browser data removes all of this. None of it is ever sent to the site. | El modo tranquilo y el modo oscuro se recuerdan en su propio navegador, para que sigan así la próxima vez. Para que el sitio también funcione sin señal, su navegador guarda una copia de sus páginas y archivos; no contiene nada de lo que usted escriba o elija. Si borra los datos de su navegador, todo esto se elimina. Nada de esto se envía nunca al sitio. | Calm mode and the language you choose are remembered in your own browser, so they stay that way next time. If you clear your browser's data, they are deleted. They are never sent to the site. **(changed since the back-translation; it reads the earlier Spanish)** |
| `privacy.outsideTitle` | Outside services | Servicios externos | Outside services |
| `privacy.outside.0.term` | Hosting: | Alojamiento: | Hosting: |
| `privacy.outside.0.text` | Cloudflare Pages, which handles the site's traffic like any web host. | Cloudflare Pages, que maneja el tráfico del sitio como cualquier servicio de alojamiento web. | Cloudflare Pages, which handles the site's traffic like any web hosting service. |
| `privacy.outside.1.term` | Fonts and 3D files: | Fuentes tipográficas y archivos 3D: | Typefaces and 3D files: |
| `privacy.outside.1.text` | served from Open Chiari itself, not from Google or other companies. | se sirven desde el propio Open Chiari, no desde Google ni otras empresas. | are served from Open Chiari itself, not from Google or other companies. |
| `privacy.outside.2.term` | Research studies: | Estudios de investigación: | Research studies: |
| `privacy.outside.2.text` | collected from ClinicalTrials.gov, run by the U.S. National Library of Medicine, once a day by the site, so your browser never contacts them. | el sitio los obtiene una vez al día de ClinicalTrials.gov, que administra la Biblioteca Nacional de Medicina de los EE. UU., así que su navegador nunca se conecta con ellos. | the site gets them once a day from ClinicalTrials.gov, which the U.S. National Library of Medicine runs, so your browser never connects with them. |
| `privacy.outside.3.term` | Links out: | Enlaces externos: | External links: |
| `privacy.outside.3.text` | donate pages, study listings and other sites have their own privacy policies. | las páginas para donar, las fichas de los estudios y otros sitios tienen sus propias políticas de privacidad. | donation pages, study listings and other sites have their own privacy policies. |
| `privacy.emailTitle` | Email | Correo electrónico | Email |
| `privacy.email.before` | If you email | Si escribe a | If you write to |
| `privacy.email.address` | hello@openchiari.org | hello@openchiari.org | hello@openchiari.org |
| `privacy.email.after` | , your message is used only to reply and isn't shared. Please don't include medical details. | , su mensaje se usa solo para responderle y no se comparte. Por favor, no incluya información médica. | , your message is used only to answer you and is not shared. Please do not include medical information. |
| `privacy.changesTitle` | Changes | Cambios | Changes |
| `privacy.changes` | If this policy changes, the date at the top changes too, and anything significant is noted on the home page for 30 days. | Si esta política cambia, también cambia la fecha de arriba, y cualquier cambio importante se anuncia en la página de inicio durante 30 días. | If this policy changes, the date above also changes, and any important change is announced on the home page for 30 days. |
| `model.title` | Use the model on your own site | Use el modelo en su propio sitio web | Use the model on your own website |
| `model.intro` | The Chiari model is free for foundations, clinics, teachers and anyone explaining Chiari. Embed the viewer, or download the files for your own projects. | El modelo de Chiari es gratis para fundaciones, clínicas, maestros y cualquier persona que explique Chiari. Inserte el visor en su sitio o descargue los archivos para sus propios proyectos. | The Chiari model is free for foundations, clinics, teachers and anyone who explains Chiari. Embed the viewer on your site or download the files for your own projects. |
| `model.licenseLabel` | License | Licencia | License |
| `model.license` | CC BY-SA 4.0 | CC BY-SA 4.0 | CC BY-SA 4.0 |
| `model.basedOnLabel` | Based on | Basado en | Based on |
| `model.zAnatomy` | Z-Anatomy | Z-Anatomy | Z-Anatomy |
| `model.basedOnRest` | (CC BY-SA 4.0) and BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP) | (CC BY-SA 4.0) y BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP) | (CC BY-SA 4.0) and BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP) |
| `model.viewsLabel` | Views included | Vistas incluidas | Views included |
| `model.views` | Typical, Chiari I, Chiari I with syrinx, after decompression | Típica, Chiari I, Chiari I con siringe, después de la descompresión | Typical, Chiari I, Chiari I with syrinx, after decompression |
| `model.checksLabel` | Accuracy checks | Comprobaciones de exactitud | Accuracy checks |
| `model.figNum` | Fig. 2 | Fig. 2 | Fig. 2 |
| `model.figCaption` | Chiari I with syrinx, one of four included views. | Chiari I con siringe, una de las cuatro vistas incluidas. | Chiari I with syrinx, one of the four views included. |
| `model.embedTitle` | Embed the viewer | Inserte el visor | Embed the viewer |
| `model.startingView` | Starting view | Vista inicial | Starting view |
| `model.viewOptions.chiari` | Chiari I | Chiari I | Chiari I |
| `model.viewOptions.typical` | Typical anatomy | Anatomía típica | Typical anatomy |
| `model.viewOptions.syrinx` | Chiari I with syrinx | Chiari I con siringe | Chiari I with syrinx |
| `model.viewOptions.surgery` | After decompression | Después de la descompresión | After decompression |
| `model.showSwitch` | Show condition switch | Mostrar el selector de afección | Show the condition selector |
| `model.showLabels` | Show labels | Mostrar los nombres | Show the names |
| `model.startCalm` | Start in Calm mode | Empezar en modo tranquilo | Start in calm mode |
| `model.iframeTitle` | Chiari malformation 3D model | Modelo 3D de la malformación de Chiari | 3D model of Chiari malformation |
| `model.copyEmbed` | Copy embed code | Copiar el código para insertar | Copy the code to embed |
| `model.downloadTitle` | Download | Descargar | Download |
| `model.columns.file` | File | Archivo | File |
| `model.columns.format` | Format | Formato | Format |
| `model.columns.bestFor` | Best for | Ideal para | Ideal for |
| `model.columns.size` | Size | Tamaño | Size |
| `model.downloads.0.file` | Web model, all four views | Modelo web, las cuatro vistas | Web model, the four views |
| `model.downloads.0.format` | glTF | glTF | glTF |
| `model.downloads.0.bestFor` | Websites and apps | Sitios web y aplicaciones | Websites and apps |
| `model.downloads.1.file` | Editable source | Fuente editable | Editable source |
| `model.downloads.1.format` | Blender | Blender | Blender |
| `model.downloads.1.bestFor` | Changing the model | Modificar el modelo | Modifying the model |
| `model.downloads.2.file` | Figure set, labeled | Juego de figuras con nombres (en inglés) | Set of figures with names (in English) |
| `model.downloads.2.format` | PNG and PDF | PNG y PDF | PNG and PDF |
| `model.downloads.2.bestFor` | Handouts and slides | Folletos y presentaciones | Brochures and presentations |
| `model.downloads.3.file` | 3D-printable plaques, typical and Chiari I | Placas para imprimir en 3D, típica y Chiari I |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `model.downloads.3.format` | STL | STL |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `model.downloads.3.bestFor` | Printing to hold and show | Imprimir para tocar y mostrar |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `model.download` | Download | Descargar | Download |
| `model.creditTitle` | How to credit it | Cómo dar crédito | How to give credit |
| `model.creditIntro` | Keep this line wherever you use the model, and share any changed version under the same license. | Mantenga esta línea dondequiera que use el modelo, y comparta cualquier versión modificada con la misma licencia. | Keep this line wherever you use the model, and share any modified version under the same license. |
| `model.creditLine` | Chiari model by Open Chiari (openchiari.org), CC BY-SA 4.0, adapted from Z-Anatomy (CC BY-SA 4.0) and BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP) | Modelo de Chiari de Open Chiari (openchiari.org), CC BY-SA 4.0, adaptado de Z-Anatomy (CC BY-SA 4.0) y BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP) | Chiari model by Open Chiari (openchiari.org), CC BY-SA 4.0, adapted from Z-Anatomy (CC BY-SA 4.0) and BodyParts3D, © The Database Center for Life Science (CC BY-SA 2.1 JP) |
| `model.copied` | Copied | Copiado | Copied |
| `embed.exploreFull` | Explore the full 3D model | Explorar el modelo 3D completo | Explore the full 3D model |
| `explain.title` | Explain It | Explain It (Explíquelo) | Explain It (Explain it) |
| `explain.backToExplorer` | Back to the 3D Explorer | Volver al explorador 3D | Back to the 3D explorer |
| `explain.previewTitle` | Preview of what they'll see | Vista previa de lo que verán | Preview of what they will see |
| `explain.intro` | Send someone a link that opens the model in this exact view, with a short note from you. | Envíe a alguien un enlace que abre el modelo exactamente en esta vista, con una nota breve suya. | Send someone a link that opens the model exactly in this view, with a short note from you. |
| `explain.noteLabel` | Your note | Su nota | Your note |
| `explain.noteHint` | Sent as your message, with the link under it. Change it however you like. | Se envía como su mensaje, con el enlace debajo. Cámbiela como quiera. | It is sent as your message, with the link below. Change it however you want. |
| `explain.explore` | Let them rotate and explore on their own | Permitir que giren y exploren el modelo por su cuenta | Allow them to rotate and explore the model on their own |
| `explain.yourLink` | Your link | Su enlace | Your link |
| `explain.copy` | Copy note and link | Copiar la nota y el enlace | Copy the note and the link |
| `explain.copied` | Copied your note and the link. | Se copiaron su nota y el enlace. | Your note and the link were copied. |
| `explain.sms` | Text message | Mensaje de texto | Text message |
| `explain.email` | Email | Correo electrónico | Email |
| `explain.qr` | QR code | Código QR | QR code |
| `explain.share` | Share | Compartir | Share |
| `explain.picture` | Picture | Imagen |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explain.pictureSaved` | The picture was saved to your downloads. | La imagen se guardó en sus descargas. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `explain.privacy` | The link holds only the view. Your note goes in your own message, not in the link, and nothing is saved on our side. | El enlace solo contiene la vista. Su nota va en su propio mensaje, no en el enlace, y no guardamos nada. | The link only contains the view. Your note goes in your own message, not in the link, and we do not save anything. |
| `explain.sharedWithYou` | Someone shared this with you | Alguien compartió esto con usted | Someone shared this with you |
| `explain.dragHint` | Drag to turn the model. | Arrastre para girar el modelo. | Drag to rotate the model. |
| `explain.lookingTitle` | What you're looking at | Lo que está viendo | What you are seeing |
| `explain.exploreFull` | Explore the full 3D model | Explorar el modelo 3D completo | Explore the full 3D model |
| `studies.title` | Research studies looking for people with Chiari | Estudios de investigación que buscan personas con Chiari | Research studies looking for people with Chiari |
| `studies.navTitle` | Research studies | Estudios de investigación | Research studies |
| `studies.intro.wide` | Every study here is listed on ClinicalTrials.gov, the U.S. government's registry run by the National Library of Medicine, and is currently recruiting. Research moves forward when patients take part. | Cada estudio de esta lista aparece en ClinicalTrials.gov, el registro del gobierno de los EE. UU. que administra la Biblioteca Nacional de Medicina, y está buscando participantes ahora. La investigación avanza cuando los pacientes participan. | Every study on this list appears on ClinicalTrials.gov, the U.S. government registry that the National Library of Medicine runs, and is looking for participants now. Research moves forward when patients take part. |
| `studies.intro.narrow` | Listed on ClinicalTrials.gov and recruiting now. | Publicados en ClinicalTrials.gov y buscando participantes ahora. | Posted on ClinicalTrials.gov and looking for participants now. |
| `studies.updated` | Updated daily · last update {date} | Se actualiza a diario · última actualización: {date} | Updated daily · last update: {date} |
| `studies.updatedNarrow` | Updated daily · {n} studies | Se actualiza a diario · {n} estudios | Updated daily · {n} studies |
| `studies.filterLabel` | Filter studies | Filtrar estudios | Filter studies |
| `studies.filters` | Filters | Filtros | Filters |
| `studies.condition` | Condition | Afección | Condition |
| `studies.conditions.chiari` | Chiari malformation | Malformación de Chiari | Chiari malformation |
| `studies.conditions.syringomyelia` | Syringomyelia | Siringomielia | Syringomyelia |
| `studies.whoCanJoin` | Who can join | Quién puede participar | Who can take part |
| `studies.ages.any` | Any age | Cualquier edad | Any age |
| `studies.ages.adults` | Adults | Adultos | Adults |
| `studies.ages.children` | Children | Niños | Children |
| `studies.ages.both` | Children and adults | Niños y adultos | Children and adults |
| `studies.near` | Near | Cerca de | Near |
| `studies.nearPlaceholder` | City, state or ZIP | Ciudad, estado o código postal | City, state or ZIP code |
| `studies.nearHint` | Only used to sort the list on your device. | Solo se usa para ordenar la lista en su dispositivo. | Only used to sort the list on your device. |
| `studies.remoteFilter` | Can take part from home | Se puede participar desde casa | Can take part from home |
| `studies.countOne` | 1 study recruiting | 1 estudio busca participantes | 1 study is looking for participants |
| `studies.countOther` | {n} studies recruiting | {n} estudios buscan participantes | {n} studies are looking for participants |
| `studies.status.RECRUITING` | Recruiting | Buscando participantes | Looking for participants |
| `studies.types.observational` | Observational | Observacional | Observational |
| `studies.types.trial` | Clinical trial | Ensayo clínico | Clinical trial |
| `studies.remote` | Remote | A distancia | Remote |
| `studies.remoteLine` | Takes part from home | Se participa desde casa | Take part from home |
| `studies.moreSites` | + {n} more | + {n} más | + {n} more |
| `studies.officialLabel` | From the official listing | De la ficha oficial (en inglés) | From the official listing (in English) |
| `studies.englishOnly` | Summary in English | Resumen en inglés | Summary in English |
| `studies.whatYoudDo` | What you'd do | Lo que haría usted | What you would do |
| `studies.runBy` | Run by | A cargo de | Run by |
| `studies.listing` | Listing | Ficha | Listing |
| `studies.listingLink` | {nct} on ClinicalTrials.gov | {nct} en ClinicalTrials.gov (en inglés) | {nct} on ClinicalTrials.gov (in English) |
| `studies.noMatch` | No studies match these filters. | Ningún estudio coincide con estos filtros. | No study matches these filters. |
| `studies.unavailable` | The study list isn't available right now. You can search for recruiting Chiari studies on ClinicalTrials.gov. | La lista de estudios no está disponible en este momento. Puede buscar estudios sobre Chiari que buscan participantes en ClinicalTrials.gov (en inglés). | The list of studies is not available right now. You can search for Chiari studies that are looking for participants on ClinicalTrials.gov (in English). |
| `studies.registryBefore` | Also see the | Vea también el | See also the |
| `studies.registry` | Bobby Jones Chiari & Syringomyelia Foundation patient registry | registro de pacientes de la Bobby Jones Chiari & Syringomyelia Foundation | patient registry of the Bobby Jones Chiari & Syringomyelia Foundation |
| `studies.registryAfter` | (enrollment currently paused). | (las inscripciones están en pausa por ahora). | (enrollments are paused for now). |
| `studies.creditBefore` | Not medical advice. Study data from | No es consejo médico. Datos de los estudios de | It is not medical advice. Study data from |
| `studies.creditSource` | ClinicalTrials.gov | ClinicalTrials.gov | ClinicalTrials.gov |
| `studies.creditAfter` | , processed {date}. Summaries simplified by Open Chiari. | , procesados el {date}. Resúmenes simplificados por Open Chiari. | , processed on {date}. Summaries simplified by Open Chiari. |
| `impact.title` | Impact | Impacto | Impact |
| `impact.intro` | How Open Chiari is used, how well it works, and how anyone can take it over. Counted without cookies or personal data. | Cómo se usa Open Chiari, qué tan bien funciona y cómo cualquiera puede hacerse cargo de él. Se cuenta sin cookies ni datos personales. | How Open Chiari is used, how well it works and how anyone can take charge of it. Counted without cookies or personal data. |
| `impact.useTitle` | Use since launch | Uso desde el lanzamiento | Use since launch |
| `impact.launched` | Launched {date} · updated daily | Lanzado el {date} · se actualiza a diario | Launched on {date} · updated daily |
| `impact.launchDate` | November 4, 2026 | 4 de noviembre de 2026 | November 4, 2026 |
| `impact.totals.visit` | Visits | Visitas | Visits |
| `impact.totals.explore` | 3D models explored | Modelos 3D explorados | 3D models explored |
| `impact.totals.explain` | Explain It links made | Enlaces de Explain It creados | Explain It links created |
| `impact.totals.study` | Study listings opened | Fichas de estudios abiertas | Study listings opened |
| `impact.totals.embedSites` | Sites embedding the model | Sitios que insertan el modelo | Sites that embed the model |
| `impact.notCounted` | Not counted yet | Aún sin contar | Not counted yet |
| `impact.totalsNote` | Totals only. Open Chiari never records who you are, what your Explain It note says, or which questions you print. | Solo totales. Open Chiari nunca registra quién es usted, lo que dice su nota de Explain It ni qué preguntas imprime. | Totals only. Open Chiari never records who you are, what your Explain It note says or which questions you print. |
| `impact.qualityTitle` | Quality report | Informe de calidad | Quality report |
| `impact.qualityRun` | Tested automatically on every update · last run {date} | Se prueba automáticamente en cada actualización · última prueba: {date} | Tested automatically on every update · last test: {date} |
| `impact.columns.check` | Check | Prueba | Test |
| `impact.columns.phone` | Phone | Teléfono | Phone |
| `impact.columns.desktop` | Desktop | Computadora | Computer |
| `impact.columns.means` | What it means | Qué significa | What it means |
| `impact.accessibility` | Accessibility | Accesibilidad | Accessibility |
| `impact.accessibilityMeans` | Usable with screen readers, keyboards and low vision | Se puede usar con lectores de pantalla, con el teclado y con baja visión | Can be used with screen readers, with the keyboard and with low vision |
| `impact.speed` | Speed | Velocidad | Speed |
| `impact.speedMeans` | How fast pages load on a typical connection | Qué tan rápido cargan las páginas con una conexión típica | How fast the pages load on a typical connection |
| `impact.score` | {n} / 100 | {n} / 100 | {n} / 100 |
| `impact.notMeasured` | Not measured yet | Aún sin medir | Not measured yet |
| `impact.standard` | Accessibility standard | Norma de accesibilidad | Accessibility standard |
| `impact.standardValue` | WCAG 2.2 AA · {result} | WCAG 2.2 AA · {result} | WCAG 2.2 AA · {result} |
| `impact.wcagPass` | passed automated checks | superó las pruebas automáticas | passed the automatic tests |
| `impact.wcagIssues` | issues found by automated checks | problemas encontrados por las pruebas automáticas | problems found by the automatic tests |
| `impact.standardMeans` | The current W3C standard; also covers WCAG 2.1 AA, the level in U.S. ADA rules | La norma actual del W3C; también cubre WCAG 2.1 AA, el nivel de las normas de la ADA en los EE. UU. | The current W3C standard; it also covers WCAG 2.1 AA, the level of the ADA rules in the U.S. |
| `impact.openTitle` | Open source: nothing gets stranded | Código abierto: nada queda abandonado | Open source: nothing gets abandoned |
| `impact.openText` | Every line of code and every model file is public: code under the MIT License, the 3D model under CC BY-SA 4.0. Any organization can run its own copy, change it, or take it over, with no fees and no dependence on one person or company. | Cada línea de código y cada archivo del modelo son públicos: el código con la licencia MIT y el modelo 3D con CC BY-SA 4.0. Cualquier organización puede poner en marcha su propia copia, cambiarla o hacerse cargo de ella, sin costo y sin depender de una sola persona o empresa. | Every line of code and every model file is public: the code under the MIT license and the 3D model under CC BY-SA 4.0. Any organization can launch its own copy, change it or take charge of it, at no cost and without depending on a single person or company. |
| `impact.code` | Code | Código | Code |
| `impact.codeLink` | github.com/ARCFrontierSystems/OpenChiari | github.com/ARCFrontierSystems/OpenChiari | github.com/ARCFrontierSystems/OpenChiari |
| `impact.codeLicense` | · MIT License | · Licencia MIT | · MIT License |
| `impact.model` | 3D model | Modelo 3D | 3D model |
| `impact.modelLicense` | CC BY-SA 4.0 | CC BY-SA 4.0 | CC BY-SA 4.0 |
| `impact.hosting` | Hosting | Alojamiento | Hosting |
| `impact.hostingText` | Free static hosting; step-by-step guide included | Alojamiento estático gratuito; incluye una guía paso a paso | Free static hosting; includes a step-by-step guide |
| `impact.personalData` | Personal data | Datos personales | Personal data |
| `impact.personalDataText` | None stored, so there's nothing to migrate | No se guarda ninguno, así que no hay nada que trasladar | None is saved, so there is nothing to move |
| `impact.orgsTitle` | For Chiari organizations | Para organizaciones de Chiari | For Chiari organizations |
| `impact.orgsText` | Want Open Chiari on your own site, in your colors, or a tool built around your needs? Let's talk. | ¿Quiere Open Chiari en su propio sitio, con sus colores, o una herramienta hecha a su medida? Hablemos. | Do you want Open Chiari on your own site, with your colors, or a tool made to measure for you? Let's talk. |
| `impact.contact` | Contact Open Chiari | Contactar a Open Chiari | Contact Open Chiari |
| `impact.footer` | A personal project by Matthew Borgfeld. Not medical advice. | Un proyecto personal de Matthew Borgfeld. No es consejo médico. | A personal project of Matthew Borgfeld. It is not medical advice. |
| `compare.title` | Side by side | Lado a lado | Side by side |
| `compare.rotateTogether` | Rotate together | Girar juntos | Rotate together |
| `compare.back` | Back to single view | Volver a una sola vista | Back to a single view |
| `compare.left` | Left view condition | Afección de la vista izquierda | Condition of the left view |
| `compare.right` | Right view condition | Afección de la vista derecha | Condition of the right view |
| `tour.title` | Guided tour | Recorrido guiado | Guided tour |
| `tour.exit` | Exit tour | Salir del recorrido | Exit the tour |
| `tour.progress` | Tour progress | Avance del recorrido | Tour progress |
| `tour.stepOf` | Step {n} of {total} | Paso {n} de {total} | Step {n} of {total} |
| `tour.back` | Back | Atrás | Back |
| `tour.next` | Next: {title} | Siguiente: {title} | Next: {title} |
| `tour.finish` | Finish tour | Terminar el recorrido | Finish the tour |
| `tour.steps.0.title` | Meet the model | Conozca el modelo | Meet the model |
| `tour.steps.1.title` | Typical anatomy | Anatomía típica | Typical anatomy |
| `tour.steps.2.title` | The tonsils sit too low | Las amígdalas cerebelosas están demasiado bajas | The cerebellar tonsils are too low |
| `tour.steps.3.title` | How fluid flows | Cómo circula el líquido | How the fluid flows |
| `tour.steps.4.title` | A syrinx | Una siringe | A syrinx |
| `kit.eyebrow` | Chiari Awareness Month · September | Mes de Concientización sobre Chiari · septiembre | Chiari Awareness Month · September |
| `kit.title` | Awareness kit | Kit de concientización | Awareness kit |
| `kit.intro` | Free graphics and printables for patients, families and organizations. Use them as they are, or add your organization's logo in the space provided. | Gráficos e imprimibles gratis para pacientes, familias y organizaciones. Úselos tal como están o agregue el logotipo de su organización en el espacio indicado. | Free graphics and printables for patients, families and organizations. Use them as they are or add your organization's logo in the space indicated. |
| `kit.zip` | Download the full kit (ZIP) | Descargar el kit completo (ZIP) | Download the complete kit (ZIP) |
| `kit.socialFooter` | openchiari.org · #ChiariAwarenessMonth | openchiari.org · #ChiariAwarenessMonth | openchiari.org · #ChiariAwarenessMonth |
| `kit.posterTitle` | What is Chiari malformation? | ¿Qué es la malformación de Chiari? | What is Chiari malformation? |
| `kit.logoSpace` | your logo | su logotipo | your logo |
| `kit.items.social.title` | Square social post | Publicación cuadrada para redes sociales | Square post for social media |
| `kit.items.social.format` | 1080 × 1080 · PNG | 1080 × 1080 · PNG | 1080 × 1080 · PNG |
| `kit.items.quote.title` | Quote card | Tarjeta con frase | Quote card |
| `kit.items.quote.format` | Square and story sizes · PNG | Tamaños cuadrado y de historia · PNG | Square and story sizes · PNG |
| `kit.items.card.title` | Explain It wallet card | Tarjeta de bolsillo de Explain It | Explain It pocket card |
| `kit.items.card.format` | Printable, 8 per page · PDF | Para imprimir, 8 por página · PDF | For printing, 8 per page · PDF |
| `kit.items.poster.title` | Event poster and handout | Cartel y folleto para eventos | Poster and flyer for events |
| `kit.items.poster.format` | Letter and A4 · PDF, with logo space | Carta y A4 · PDF, con espacio para logotipo | Letter and A4 · PDF, with space for logo |
| `kit.download` | Download | Descargar | Download |
| `kit.letter` | Letter | Carta | Letter |
| `kit.orgsTitle` | For organizations | Para organizaciones | For organizations |
| `kit.orgsText` | Need the kit in your colors, or a version for a specific event? Get in touch and it's made for you, free. | ¿Necesita el kit con sus colores o una versión para un evento en particular? Escríbanos y se lo hacemos, gratis. | Do you need the kit with your colors or a version for a particular event? Write to us and we'll make it for you, free. |
| `kit.contact` | Contact Open Chiari | Contactar a Open Chiari | Contact Open Chiari |
| `kit.license` | Kit graphics are free to use and share, CC BY-SA 4.0. Graphics showing the 3D model also carry the Z-Anatomy and BodyParts3D credit. | Los gráficos del kit se pueden usar y compartir libremente, CC BY-SA 4.0. Los gráficos que muestran el modelo 3D también llevan el crédito de Z-Anatomy y BodyParts3D. | The kit graphics can be used and shared freely, CC BY-SA 4.0. The graphics that show the 3D model also carry the credit for Z-Anatomy and BodyParts3D. |
| `children.title` | Helping your child through Chiari surgery | Cómo ayudar a su hijo con la cirugía de Chiari |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.navLabel` | Helping your child | Cómo ayudar a su hijo |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.intro` | Ideas from children's hospitals for getting a child ready, a picture story to read together, a coloring page, and a sheet for school. Nothing you type here is saved or sent. | Ideas de hospitales infantiles para preparar a un niño, un cuento con dibujos para leer juntos, una página para colorear y una hoja para la escuela. Nada de lo que escriba aquí se guarda ni se envía. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.title` | Getting ready together | Prepararse juntos |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.0.lead` | Be honest, in words your child knows. | Hable con honestidad, con palabras que su hijo conozca. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.0.text` | Younger children usually need fewer details than older kids. Teens may want to know more and to help make decisions. | Los niños más pequeños suelen necesitar menos detalles que los mayores. Los adolescentes quizá quieran saber más y participar en las decisiones. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.1.lead` | Say why. | Explique el porqué. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.1.text` | The surgery is to help a part of their body do its job. | La cirugía es para ayudar a que una parte de su cuerpo haga su trabajo. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.2.lead` | Call it a special sleep. | Llámelo un sueño especial. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.2.text` | The medicine for surgery gives a special sleep, so they won't see, hear or feel anything, and the care team wakes them when it's over. Avoid "put to sleep": some children know it from pets that never woke up. | La medicina para la cirugía da un sueño especial, así que no verá, oirá ni sentirá nada, y el equipo médico lo despertará cuando termine. Evite decir "lo van a dormir": algunos niños conocen esa frase por mascotas que nunca despertaron. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.3.lead` | Don't promise "no pain" or "no needles." | No prometa "nada de dolor" ni "nada de agujas". |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.3.text` | Instead, say the nurses and doctors have medicine and ways to help. | En cambio, dígale que las enfermeras y los médicos tienen medicinas y maneras de ayudar. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.4.lead` | It's fine to say "I don't know." | Está bien decir "no sé". |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.4.text` | Write the question down and ask the care team together. | Anote la pregunta y háganla juntos al equipo médico. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.5.lead` | Accept their feelings. | Acepte sus sentimientos. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.5.text` | Let them know it's OK to feel scared, or even mad. | Dígale que está bien sentir miedo, o incluso enojo. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.6.lead` | Be ready for changes. | Prepárese para posibles cambios. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.6.text` | Sometimes surgery is delayed or cancelled because of emergencies. | A veces la cirugía se retrasa o se cancela por emergencias. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.7.lead` | Bring something from home. | Lleve algo de casa. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.7.text` | A favorite blanket or stuffed animal can help. Ask whether it can go into the operating room. | Su cobija o peluche favorito puede ayudar. Pregunte si su hijo puede llevarlo al quirófano. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.8.lead` | Play and draw it. | Jueguen y dibujen juntos. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.8.text` | Acting out a hospital visit with toys, or drawing it, can show you how your child feels. | Representar una visita al hospital con juguetes, o dibujarla, puede mostrarle cómo se siente su hijo. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.9.lead` | Ask if the hospital has a child life specialist. | Pregunte si el hospital tiene un especialista en vida infantil (child life). |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.9.text` | They are trained to talk with children in a comforting way. | Están capacitados para hablar con los niños de una manera reconfortante. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.10.lead` | Look after yourself too. | Cuídese usted también. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.tips.10.text` | Children pick up on how you feel. Accept help when it's offered. Talking with a counselor or social worker can help too. | Los niños perciben cómo se siente usted. Acepte la ayuda que le ofrezcan. Hablar con un consejero o un trabajador social también puede ayudar. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.ready.source` | Adapted from SickKids AboutKidsHealth and Nemours KidsHealth. | Adaptado de SickKids AboutKidsHealth y Nemours KidsHealth. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.story.title` | A picture story to read together | Un cuento con dibujos para leer juntos |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.story.intro` | Read it with your child, and skip any page you like. Change any words to match what your care team tells you. | Léalo con su hijo y sáltese las páginas que quiera. Cambie las palabras que haga falta para que coincidan con lo que le diga su equipo médico. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.story.pageLabel` | Page {n} | Página {n} |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.story.pages.0.figure` | typical | typical |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.story.pages.0.text` | This is a picture of the inside of a head and neck, as if we could look in from the side. | Este es un dibujo del interior de una cabeza y un cuello, como si pudiéramos mirar desde un lado. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.story.pages.1.figure` | typical | typical |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.story.pages.1.text` | Your brain is inside your skull. Near the back is a part called the cerebellum. It helps you balance and move smoothly. Your brain and spinal cord are cushioned by a clear liquid. | Tu cerebro está dentro de tu cráneo. Cerca de la parte de atrás hay una parte que se llama cerebelo. Te ayuda a mantener el equilibrio y a moverte con suavidad. Tu cerebro y tu médula espinal están protegidos por un líquido transparente. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.story.pages.2.figure` | chiari | chiari |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.story.pages.2.text` | In Chiari, the bottom of the cerebellum reaches down a little too low, through the opening where the skull meets the neck. There isn't quite enough room there. You didn't do anything to cause it. | En Chiari, la parte de abajo del cerebelo baja un poco más de lo normal, por la abertura donde el cráneo se une con el cuello. Ahí no hay suficiente espacio. Tú no hiciste nada para causarlo. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.story.pages.3.figure` | surgery | surgery |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.story.pages.3.text` | Doctors can make more room. During surgery you'll be in a special sleep from medicine, so you won't see, hear or feel anything. The surgeon takes away a small piece of bone at the back of the head, and often a little from the top of the neck. Many times they also add a patch to make more space. | Los médicos pueden hacer más espacio. Durante la cirugía tendrás un sueño especial gracias a una medicina, así que no verás, oirás ni sentirás nada. El cirujano quita un pedacito de hueso de la parte de atrás de la cabeza y, a menudo, un poco de la parte de arriba del cuello. Muchas veces también pone un parche para hacer más espacio. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.story.pages.4.text` | When you wake up, the back of your head and neck may feel sore. Your nurses and doctors have medicine to help. You'll stay in the hospital until your doctors say you're ready to go home. Your grown-up will tell you about how long, and will be with you as much as they can. You can bring your favorite blanket or stuffed animal. | Cuando despiertes, es posible que te duela la parte de atrás de la cabeza y del cuello. Tus enfermeras y médicos tienen medicinas para ayudarte. Te quedarás en el hospital hasta que tus médicos digan que ya puedes volver a casa. Los adultos que te cuidan te dirán más o menos cuánto tiempo, y estarán contigo todo lo que puedan. Puedes llevar tu cobija o peluche favorito. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.story.pages.5.text` | Then you'll rest at home for a while before going back to school. You can ask questions anytime. Every question is a good one. | Después descansarás en casa un tiempo antes de volver a la escuela. Puedes hacer preguntas cuando quieras. Todas las preguntas son buenas. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.story.print` | Print the story | Imprimir el cuento |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.color.title` | Color it in | Para colorear |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.color.intro` | Two drawings to print and color: before and after surgery. | Dos dibujos para imprimir y colorear: antes y después de la cirugía. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.color.before` | Before surgery | Antes de la cirugía |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.color.after` | After surgery | Después de la cirugía |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.color.key` | A suggested key (any colors are fine): bone, brain, spinal cord, the clear liquid. | Colores sugeridos (cualquier color está bien): hueso, cerebro, médula espinal, el líquido transparente. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.color.print` | Print the coloring page | Imprimir la página para colorear |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.title` | A sheet for school | Una hoja para la escuela |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.intro` | Fill in what you like, then print it for a teacher or the school nurse. Every box is optional. | Llene lo que quiera y luego imprímala para un maestro o la enfermera de la escuela. Todos los campos son opcionales. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.name` | Child's first name | Nombre de pila del niño |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.forWhom` | For | Para |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.forHint` | Teacher or school nurse | Maestro o enfermera de la escuela |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.date` | Surgery date | Fecha de la cirugía |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.timeAway` | Expected time away from school | Tiempo previsto fuera de la escuela |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.limits` | Limits from the surgeon (for example, sports, PE, lifting) | Límites indicados por el cirujano (por ejemplo, deportes, educación física, levantar peso) |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.careTeamHint` | From the care team | Según el equipo médico |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.helps` | Things that may help when they're back | Cosas que pueden ayudar cuando regrese |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.helpItems.0` | Rest breaks | Pausas para descansar |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.helpItems.1` | A pass to the nurse | Un pase para ir con la enfermera |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.helpItems.2` | Extra time for missed work | Más tiempo para el trabajo atrasado |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.helpItems.3` | Help carrying books or a heavy bag | Ayuda para cargar libros o una mochila pesada |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.other` | Other | Otro |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.contact` | Parent or caregiver contact | Contacto de los padres o cuidadores |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.sheetTitle` | About {name}'s Chiari surgery | Sobre la cirugía de Chiari de {name} |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.sheetTitleDefault` | About my child's Chiari surgery | Sobre la cirugía de Chiari de mi hijo |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.lead` | {name} is having, or has had, surgery for Chiari I malformation. | {name} va a tener, o ya tuvo, una cirugía por malformación de Chiari tipo I. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.leadDefault` | My child is having, or has had, surgery for Chiari I malformation. | Mi hijo va a tener, o ya tuvo, una cirugía por malformación de Chiari tipo I. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.explain` | In Chiari I, the lowest part of the back of the brain extends below the opening at the base of the skull. The surgery makes more room there. | En Chiari I, la parte más baja de la parte de atrás del cerebro se extiende por debajo de la abertura en la base del cráneo. La cirugía hace más espacio ahí. |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.print` | Print the school sheet | Imprimir la hoja para la escuela |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.school.callIf` | Please call me right away if | Por favor llámeme de inmediato si |  **(changed since the back-translation; it reads the earlier Spanish)** |
| `children.pageNote` | Not medical advice. Nothing you type on this page is stored or sent. | No es consejo médico. Nada de lo que escriba en esta página se guarda ni se envía. |  **(changed since the back-translation; it reads the earlier Spanish)** |

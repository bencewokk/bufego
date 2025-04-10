import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faSchool, faHandshake, faRocket } from '@fortawesome/free-solid-svg-icons';

export const About = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-[var(--text)]">Rólunk</h2>
          <p className="text-lg text-gray-600">
            A BüféGO egy innovatív platform, amely összeköti a diákokat az iskolai büfékkel,
            hogy egyszerűbbé és gyorsabbá tegye a mindennapos étkezést.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center mb-16">
          <div className="w-full md:w-1/2 mb-8 md:mb-0">
            <div className="bg-gradient-to-r to-[var(--primary-light)] from-[var(--primary)] p-8 rounded-lg text-white">
              <h3 className="text-2xl font-bold mb-4">Küldetésünk</h3>
              <p className="mb-4">
                Célunk egyszerűbbé tenni a diákok mindennapjait az iskolai étkezés terén, 
                miközben csökkentjük a sorban állással töltött időt és javítjuk az iskolai 
                büfék hatékonyságát.
              </p>
              <p>
                Hiszünk abban, hogy egy jól működő étkezési rendszer nemcsak kényelmet nyújt, 
                hanem hozzájárul a diákok jobb közérzetéhez és iskolai teljesítményéhez is.
              </p>
            </div>
          </div>
          <div className="w-full md:w-1/2 md:pl-12">
            <h3 className="text-2xl font-bold mb-4 text-[var(--text)]">Történetünk</h3>
            <p className="text-gray-600 mb-4">
              A BüféGO ötlete diákok körében született, akik maguk is megtapasztalták a 
              rövid szünetek alatt a büfénél kialakuló hosszú sorok problémáját.
            </p>
            <p className="text-gray-600">
              2023-ban indítottuk el szolgáltatásunkat néhány budapesti iskolában, 
              és azóta folyamatosan bővülünk, hogy minél több diák számára elérhetővé 
              tegyük a gyors és kényelmes étkezés lehetőségét.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: faUsers,
              stat: "10,000+",
              label: "Elégedett diák"
            },
            {
              icon: faSchool,
              stat: "50+",
              label: "Partneri iskola"
            },
            {
              icon: faHandshake,
              stat: "75+",
              label: "Büfé partner"
            },
            {
              icon: faRocket,
              stat: "100,000+",
              label: "Sikeres rendelés"
            }
          ].map((item, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg text-center">
              <div className="text-[var(--primary)] text-3xl mb-3">
                <FontAwesomeIcon icon={item.icon} />
              </div>
              <div className="text-2xl font-bold text-[var(--text)]">{item.stat}</div>
              <div className="text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a 
            href="/contact" 
            className="bg-[var(--primary)] text-white px-8 py-3 rounded-full 
                    font-medium hover:bg-[var(--primary-light)] transition-colors inline-block"
          >
            Kapcsolat felvétele
          </a>
        </div>
      </div>
    </section>
  );
};
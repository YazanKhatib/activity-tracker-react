import * as React from 'react';
import Navbar from './components/Navbar';
import axios from 'axios';

interface ActivityI {
  id: string;
  name: string;
  type: string;
  duration?: any;
  start?: any;
  stop?: any;
}

const App: React.FC = () => {
  const [activity, setActivity] = React.useState<ActivityI>({
    id: '',
    name: '',
    type: '',
  });
  const [name, setName] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [time, setTime] = React.useState(0);
  const [start, setStart] = React.useState(false);
  const [activities, setActivities] = React.useState([]);

  React.useEffect(() => {
    let interval: any = null;
    if (start) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [start]);

  React.useEffect(() => {
    try {
      const getActivities = async () => {
        const { data } = await axios.get('https://activity-tracker-nodejs.herokuapp.com/activity');
        setActivities(data.activities);
      };

      getActivities();
    } catch (e: any) {
      console.log(e.message);
    }
  }, []);

  const onSubmit = async () => {
    try {
      await axios.post('https://activity-tracker-nodejs.herokuapp.com/activity', {
        name,
        type: category,
      });

      setName('');
      setCategory('');
    } catch (e: any) {
      console.log(e.message);
    }
  };

  const onChange = async (status: boolean) => {
    setStart(status);
    const now = new Date(Date.now());
    if (status) {
      setActivity({ ...activity, start: now });
    } else {
      setActivity({ ...activity, stop: now });
      setTime(0);
    }

    const { data } = await axios.patch(
      `https://activity-tracker-nodejs.herokuapp.com/activity/${activity.id}`,
      {
        start: status ? now : undefined,
        stop: status ? undefined : now,
        //@ts-ignore
        duration: status ? undefined : (now.getTime() - activity.start.getTime()) / 1000,
      }
    );
    setActivities(data.activities);
  };

  return (
    <section>
      <Navbar />
      <div className='m-auto my-12 flex w-4/5 max-w-6xl flex-col items-center justify-center'>
        <div className='m-auto w-full'>
          <h1 className='mb-6 text-center text-5xl text-gray-600'>
            {activity.name ? activity.name : 'Pick an activity'}
          </h1>
          <div className='mb-6 flex w-full items-center justify-center'>
            <span className='text-8xl text-gray-600'>
              {('0' + (Math.floor(time / 3600000) % 24)).slice(-2)}:
            </span>
            <span className='text-8xl text-gray-600'>
              {('0' + Math.floor((time / 60000) % 60)).slice(-2)}:
            </span>
            <span className='text-8xl text-gray-600'>
              {('0' + Math.floor((time / 1000) % 60)).slice(-2)}
            </span>
          </div>

          <div className='m-auto flex w-1/3 justify-between'>
            <button
              disabled={!activity.name || activity.start ? true : false}
              className={`mr-4 w-[120px] rounded-lg py-2 font-bold text-white ${
                !activity.name || activity.start ? 'bg-gray-300' : 'bg-gray-600'
              }`}
              onClick={() => onChange(true)}>
              Start
            </button>
            <button
              disabled={!activity.name || activity.stop ? true : false}
              className={`w-[120px] rounded-lg bg-gray-600 py-2 font-bold text-white ${
                !activity.name || activity.stop ? 'bg-gray-300' : 'bg-gray-600'
              }`}
              onClick={() => onChange(false)}>
              Stop
            </button>
          </div>
        </div>

        <div className='w-full'>
          <h1 className='mb-8 mt-8 text-lg font-bold'>Pick an activity or Create a new activity</h1>
        </div>
        <div className='flex w-full flex-col justify-between lg:h-[320px] lg:flex-row'>
          <div className='mb-8 rounded-3xl bg-gray-600 p-6 lg:mb-0 lg:w-[45%]'>
            <form>
              <div className='mb-4'>
                <div className='pb-2 font-bold text-white'>Name</div>
                <input
                  name='name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className='w-full rounded-lg p-2'
                />
              </div>

              <div className='mb-8'>
                <div className='pb-2 font-bold text-white'>Category</div>
                <input
                  name='category'
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className='w-full rounded-lg p-2'
                />
              </div>

              <button
                onClick={onSubmit}
                className='w-full rounded-xl bg-cyan-300 p-2 text-center font-bold text-white'>
                Submit
              </button>
            </form>
          </div>

          <div className='flex flex-col items-center overflow-y-scroll rounded-3xl bg-white p-4 lg:w-[45%]'>
            {activities &&
              activities.map((activity: any, key) => (
                <div
                  key={key}
                  onClick={() => setActivity(activity)}
                  className='shadown-md mb-4 flex w-full cursor-pointer rounded-3xl bg-cyan-100 p-4 last:mb-2 hover:bg-cyan-200'>
                  <div className='w-1/3'>
                    <span className='rounded-xl bg-white px-3 py-1 font-bold text-cyan-300'>
                      {activity.type}
                    </span>
                  </div>

                  <div>
                    <h1 className='text-md font-bold'>{activity.name}</h1>
                    <h1 className='text-md font-bold'>{`Duration: ${
                      activity.duration === undefined
                        ? '__'
                        : `${Math.floor(activity.duration / 60)} mins - ${Math.round(
                            activity.duration % 60
                          )} secs `
                    }`}</h1>
                    <h1 className='text-md font-bold'>{`Start: ${
                      activity.start === undefined ? '__' : new Date(activity.start).toUTCString()
                    }`}</h1>
                    <h1 className='text-md font-bold'>{`Stop: ${
                      activity.stop === undefined ? '__' : new Date(activity.stop).toUTCString()
                    } `}</h1>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default App;

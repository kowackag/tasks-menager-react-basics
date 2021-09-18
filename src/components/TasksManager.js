import React from 'react';
import TasksAPI from './TasksAPI';
const tasksDB = new TasksAPI(); 

class TasksManager extends React.Component {
    state = {
        tasks: []
    }
    
    render() {
        return (
            <>
                <h1>TasksManager</h1>
                <section onSubmit = {this.addTask}>
                <form>
                    <input name ="title" onChange={this.changeInput}/>
                    <input name="time" onChange={this.changeInput}></input>
                    <input type ="submit"/>
                </form>
                </section>
                <section>
                    <ul>{this.renderTaskList()}</ul>
                </section>
            </>
        )
    }

    renderTaskList() {
        return (this.state.tasks.map(item => {
            const {title, time, id, isRemoved}= item;
            if(!isRemoved) {
                return (
                    <li data-id={id}> 
                        <header>
                            <h2>{title}</h2>
                            <p>Czas:{time}sekund</p>
                        </header>
                        <footer>
                            <button onClick ={this.runTask}>start</button>
                            <button>zakończone</button>
                            <button>usuń</button>
                        </footer>
                    </li>
                )
            }
        }))
    }



    componentDidMount (){
        tasksDB.loadData()
         .then(res => {
            return res.map(item => { console.log(item)
           this.setData(item)}
                )
         })
         // .then(res => console.log(res))
     }
     setData = e => {
         this.setState({tasks: data});
     }
 
 
     onClick = () => {
         const { tasks } = this.state;
         console.log( tasks)
     }

    addTask = e => {
        e.preventDefault();
        const {title, time} = e.target.elements
        const data = {
            title: title.value,
            time: time.value,
        }
        console.log(data, typeof data)
        tasksDB.addData(data)
    }

    changeInput =e => {
        // console.log(e.target.value)
    }

}

export default TasksManager;
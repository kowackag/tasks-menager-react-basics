import React from 'react';
import TasksAPI from './TasksAPI';
const tasksDB = new TasksAPI(); 

class TasksManager extends React.Component {
    state = {
        tasks: []
    }
    
    render() {
        console.log('render')
        return (
            <>
                <h1>TasksManager</h1>
                <section onSubmit = {this.addTaskToDB}>
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
        .then(resp => { return resp.map(item => this.setState({tasks: [...this.state.tasks, item]}))
            })
     }

    onClick = () => {
         const { tasks } = this.state;
         console.log( tasks)
     }

    addTaskToDB = e => {
        e.preventDefault();
        const {title, time} = e.target.elements
        const task = {
            title: title.value,
            time: time.value,
        }
        if (title.value.length>3 && time.value >0 ) {
            tasksDB.addData(task)
            .then(this.loadTasks())
            .catch(err=>console.log(err))
        } else (alert('Treść zadania nie może mieć mniej niż 3 znaki a czas nie moze byc mniejszy od 0'))
    }

    changeInput =e => {
        // console.log(e.target.value)
    }

    loadTasks() {
        this.setState({tasks:[]})
        tasksDB.loadData()
            .then(resp => { return resp.map(item => this.setState({tasks: [...this.state.tasks, item]}))})
    }
}

export default TasksManager;
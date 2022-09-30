import Collaborator from "../models/Collaborator.js"
import Project from "../models/Project.js"
import User from "../models/User.js"

export const AllUsers = async (req,res)=>{
  try {
    const findInDb = await User.find({})
    res.status(200).json(findInDb)
  } catch (error) {
    res.status(400).json(error.message)
  }
}

export const userProjects = async (req, res)=>{
    let {id} = req.body
    let getMyProjects = await User.findById(id)
    if (getMyProjects.projects.length){
        let projets = getMyProjects.projects.map(async m => await Project.findById(m))
        const resPromises = await Promise.all(projets)
        res.json(resPromises)
      } else {
        res.status(404).send("you don't have any project")
      }
}

export const userCollaborations = async (req,res)=>{
  let {idProject, idUser, linkedin, number, text, email} = req.body 
  const message = "you must complete the required fields"
  if(!idProject && !idUser && !linkedin && !number && !text && !email) res.status(400).json({message})
try {
  let project = await Project.findById(idProject)
  let collabsProject = project.collaborators.map(async m => await Collaborator.findById(m))
  let respromise = await Promise.all(collabsProject)
  
  let findUsers = respromise.map(async m => await User.findById(m.idUser))
  let resUserpromises = await Promise.all(findUsers)
  let conditioncollab = resUserpromises.filter(f=> f._id==idUser)

  if(conditioncollab.length) throw new Error('you have already joined this project')

  let user = await User.findById(idUser)

  if(project && user){
    let newCollaborator = await Collaborator.create({idUser, linkedin, number, text, email})
    let mycollaborations= await User.findByIdAndUpdate(idUser,{ $push: { 'collaborations': idProject } })
    await mycollaborations.save()
    let pendingcolaborators = await Project.findByIdAndUpdate(idProject,{ $push: { 'collaborators': newCollaborator._id } })
    await pendingcolaborators.save()
    res.status(200).json({message:'collaboration sent successfully'})
  }
  } catch (error) {
    res.status(400).json(error.message)
  }
}
